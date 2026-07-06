import esbuild from "esbuild";
import fs from "fs";
import { execSync } from "child_process";
import { ZipArchive } from "archiver";

const entryPoints = [
    "src/get-status/handler.ts",
    "src/start-session/handler.ts",
    "src/get-session/handler.ts",
    "src/cancel-session/handler.ts",
    "src/save-session/handler.ts",
    "src/add-exercise/handler.ts",
    "src/delete-exercise/handler.ts",
    "src/add-set/handler.ts",
    "src/delete-set/handler.ts",
    "src/update-set/handler.ts",
    "src/update-stats/handler.ts",
    "src/archive-workout/handler.ts",
    "src/get-stats/handler.ts",
];

function zipDirectory(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = new ZipArchive({
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
    const layerDirectory = "src/layers/shared-libs-layer/nodejs";
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
        outdir: "dist",
        external: ["@aws-sdk/*", "ajv"],
    });

    console.log("Creating zip files...");
    for (const entryPoint of entryPoints) {
        const lambdaName = entryPoint.split("/")[1];
        await zipDirectory(`dist/${lambdaName}`, `dist/zip/${lambdaName}.zip`);
    }

    await zipDirectory(
        "src/layers/shared-libs-layer",
        "dist/zip/shared-libs-layer.zip",
    );

    console.log("Build success.");
}

runBuild().catch(() => process.exit(1));
