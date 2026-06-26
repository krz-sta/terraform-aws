import esbuild from "esbuild";

async function runBuild() {
    await esbuild.build({
        entryPoints: [
            "src/get-status/handler.js",
            "src/start-session/handler.js",
            "src/get-session/handler.js",
            "src/cancel-session/handler.js",
            "src/save-session/index.js",
            "src/add-exercise/handler.js",
            "src/delete-exercise/index.js",
            "src/add-set/index.js",
            "src/delete-set/index.js",
            "src/update-set/index.js",
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
