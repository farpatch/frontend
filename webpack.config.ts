const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const OUTPUT = "build";

import { installMiddlewares } from './mock/webpack.farpatch';

import { subsetIconfont, MdiProvider, FaFreeProvider } from 'subset-iconfont';

const mdi = new MdiProvider(['home', 'keyboard', 'chip', 'script-text', 'tune', 'menu']);

subsetIconfont([mdi], './icons', { formats: ['ttf', 'woff2', 'eot', 'woff'] }).then(
    (result) => {
        console.log('Font subsetting complete');
    }
);

var proxyTarget: Array<any> = [];
if (process.env.PROXY_TARGET !== undefined) {
    proxyTarget = [
        {
            context: ['/ws'],
            target: 'ws://' + process.env.PROXY_TARGET,
            ws: true,
            onError(err: any, _req: any, _res: any) {
                console.log('Suppressing WDS proxy upgrade error:', err);
            },
        },
        {
            context: ['/fp'],
            target: 'http://' + process.env.PROXY_TARGET,
            ws: false,
        },
    ];
}

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, './src/index.ts'),
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "static", to: path.resolve(__dirname, OUTPUT) },
                { from: "node_modules/xterm/css/xterm.css", to: path.resolve(__dirname, OUTPUT, 'css') },
                { from: "icons/webfonts", to: path.resolve(__dirname, OUTPUT, 'webfonts') },
                { from: "icons/css/all.min.css", to: path.resolve(__dirname, OUTPUT, 'css/subset-iconfont.min.css') }
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
        webSocketServer: {
            type: 'ws',
            options: {
                path: '/websocket-hmr',
            },
        },
        client: {
            webSocketURL: 'auto://0.0.0.0:0/websocket-hmr',
        },
        allowedHosts: 'all',
        static: {
            directory: path.resolve(__dirname, OUTPUT),
        },
        compress: true,
        port: 9000,
        proxy: proxyTarget,
        setupMiddlewares: (middlewares: any, devServer: any) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            if (process.env.PROXY_TARGET === undefined) {
                console.log("PROXY_TARGET not set -- creating mock API server");
                installMiddlewares(devServer.app);
            } else {
                console.log("Proxying connections to " + process.env.PROXY_TARGET);
            }
            return middlewares;
        }
    },
};
