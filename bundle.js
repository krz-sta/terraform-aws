import esbuild from "esbuild";

async function runBuild() {
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
        ],
        bundle: true,
        minify: false,
        platform: "node",
        target: "node24",
        outdir: "dist",
        external: ["@aws-sdk/*", "ajv"],
    });

    console.log("Build success.");
}

runBuild().catch(() => process.exit(1));
