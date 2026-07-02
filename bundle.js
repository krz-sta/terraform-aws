import esbuild from "esbuild";
import fs from "fs";
import { execSync } from "child_process";

async function runBuild() {
    console.log("Copying node_modules...");
    const layerDirectory = "src/layers/shared-libs-layer/nodejs";
    fs.mkdirSync(layerDirectory, { recursive: true });
    fs.cpSync("package.json", `${layerDirectory}/package.json`);
    execSync("npm install --omit=dev", {
        cwd: layerDirectory,
    });

    console.log("Building Lambda functions...");
    await esbuild.build({
        entryPoints: [
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
        ],
        bundle: true,
        minify: true,
        platform: "node",
        target: "node24",
        outdir: "dist",
        external: ["@aws-sdk/*", "ajv"],
    });

    console.log("Build success.");
}

runBuild().catch(() => process.exit(1));
