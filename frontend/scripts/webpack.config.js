const path = require('path');

module.exports = {
    entry: './main.ts',
    module: {
        defaultRules: [
            {
                type: 'javascript/auto',
                resolve: {},
            },
            {
                test: /\.json$/,
                type: 'json',
            },
        ],
        rules: [
            {
                test: /\.ts$/,
                use:'ts-loader',
                exclude: /node-modules/,
            },
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        publicPath: 'scripts/'
    },
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true,
    },
    mode: "production"
}