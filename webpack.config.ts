const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const OUTPUT = "build";

import { installMiddlewares } from './mock/webpack.farpatch';

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, './src/index.ts'),
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "static", to: path.resolve(__dirname, OUTPUT) },
                { from: "node_modules/xterm/css/xterm.css", to: path.resolve(__dirname, OUTPUT, 'css') }
            ],
        }),
    ],
    performance: {
        maxAssetSize: 512000
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, OUTPUT),
    },
    devServer: {
        allowedHosts: 'all',
        static: {
            directory: path.resolve(__dirname, OUTPUT),
        },
        compress: true,
        port: 9000,
        setupMiddlewares: (middlewares: any, devServer: any) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            installMiddlewares(devServer.app);
            return middlewares;
        }
    },
};
