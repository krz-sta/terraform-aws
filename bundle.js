const esbuild = require("esbuild");

async function runBuild() {
    await esbuild.build({
        entryPoints: [
            'src/get-status/index.js',
            'src/start-session/index.js',
            'src/get-session/index.js',
            'src/cancel-session/index.js',
            'src/save-session/index.js',
            'src/add-exercise/index.js',
            'src/delete-exercise/index.js',
            'src/add-set/index.js',
            'src/delete-set/index.js',
        ],
        bundle: true,
        minify: false,
        platform: 'node',
        target: 'node24',
        outdir: 'dist',
        external: ['@aws-sdk/*']
    });

    console.log('Build success.')
}

runBuild().catch(() => process.exit(1))