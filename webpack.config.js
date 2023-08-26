const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/provider.js',
    output: {
        path: path.join(__dirname, "/dist"),
        filename: 'evm-chains-provider.js',
        library: 'EvmChains',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true,
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1, // disable creating additional chunks
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    resolve: {
        extensions: ["", ".js", ".jsx"],
        fallback: {
            http: false, 
            https: false,
            stream: false,
            zlib: false,
        }
    }
};