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
            "src/get-status/handler.js",
            "src/start-session/handler.js",
            "src/get-session/handler.js",
            "src/cancel-session/handler.js",
            "src/save-session/handler.js",
            "src/add-exercise/handler.js",
            "src/delete-exercise/handler.js",
            "src/add-set/handler.js",
            "src/delete-set/handler.js",
            "src/update-set/handler.js",
            "src/update-stats/handler.js",
            "src/archive-workout/handler.js",
            "src/get-stats/handler.js",
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
