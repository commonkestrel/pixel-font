const path = require('path');

module.exports = {
    entry: './main.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use:'ts-loader',
                exclude: /node-modules/,
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
    },
    mode: "production"
}