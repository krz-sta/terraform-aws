import esbuild from "esbuild";
import fs from "fs";
import { execSync } from "child_process";
import archiver from "archiver";
import path from "path";
import crypto from "crypto";

const CACHE_FILE = "dist/.build-cache.json";

const entryPoints = [
    "src/features/archive/archive-workout/handler.ts",
    "src/features/data/check-active-session/handler.ts",
    "src/features/data/cleanup-delete-data/handler.ts",
    "src/features/data/delete-user-data/handler.ts",
    "src/features/data/start-delete-data/handler.ts",
    "src/features/exercises/add-exercise/handler.ts",
    "src/features/exercises/delete-exercise/handler.ts",
    "src/features/sessions/cancel-session/handler.ts",
    "src/features/sessions/get-session/handler.ts",
    "src/features/sessions/save-session/handler.ts",
    "src/features/sessions/start-session/handler.ts",
    "src/features/sets/add-set/handler.ts",
    "src/features/sets/delete-set/handler.ts",
    "src/features/sets/update-set/handler.ts",
    "src/features/stats/get-stats/handler.ts",
    "src/features/stats/update-stats/handler.ts",
    "src/features/status/get-status/handler.ts",
];

const layers = ["src/infrastructure/layers/shared-libs-layer/nodejs"];

function zipDirectory(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        output.on("close", resolve);
        output.on("error", reject);
        archive.on("error", reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

async function runBuild() {
    fs.mkdirSync("dist/zip", { recursive: true });

    console.log("Copying node_modules...");
    const layerDirectory = "src/infrastructure/layers/shared-libs-layer/nodejs";
    fs.mkdirSync(layerDirectory, { recursive: true });
    fs.cpSync("package.json", `${layerDirectory}/package.json`);
    execSync("npm install --omit=dev", {
        cwd: layerDirectory,
    });

    console.log("Building Lambda functions...");
    await esbuild.build({
        entryPoints,
        bundle: true,
        minify: true,
        platform: "node",
        target: "node24",
        format: "esm",
        outdir: "dist",
        outExtension: { ".js": ".mjs" },
        external: ["@aws-sdk/*", "ajv", "@dsnp/parquetjs", "@middy/*"],
    });

    console.log("Creating zip files...");
    for (const entryPoint of entryPoints) {
        const lambdaName = path.dirname(entryPoint).split("/").pop();
        await zipDirectory(
            `${path.dirname(entryPoint).replace("src/features", "dist")}`,
            `dist/zip/${lambdaName}.zip`,
        );
    }

    for (const layer of layers) {
        const layerDir = path.dirname(layer);
        const layerName = layerDir.split("/").pop();
        await zipDirectory(layerDir, `dist/zip/${layerName}.zip`);
    }

    console.log("Build success.");
}

runBuild().catch(() => process.exit(1));
