const esbuild = require("esbuild");

async function runBuild() {
    await esbuild.build({
        entryPoints: [
            'src/get-status/index.js',
            'src/start-session/index.js',
            'src/get-session/index.js',
            'src/cancel-session/index.js'
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