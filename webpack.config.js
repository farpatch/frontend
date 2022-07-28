const path = require("path");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: ["./src/index.tsx"],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { plugins: ['react-refresh/babel'], presets: ["@babel/env"] }
            },
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.svg$/,
                use: 'file-loader'
            },
            {
                test: /\.png$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            mimetype: 'image/png'
                        }
                    }
                ]
            }
        ]
    },
    resolve: { extensions: ["*", ".js", ".jsx", ".ts", ".tsx"] },
    output: {
        path: path.resolve(__dirname, "dist/"),
        publicPath: "/dist/",
        filename: "bundle.js"
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "static/"),
        },
        port: 3000,
        devMiddleware: {
            publicPath: "http://localhost:3000/dist/",
        },
        proxy: {
            '/debugws': {
                target: 'ws://10.0.237.108:80',
                ws: true
            },
            '/rtt': {
                target: 'ws://10.0.237.108:80',
                ws: true
            },
            '/terminal': {
                target: 'ws://10.0.237.108:80',
                ws: true
            },
            '/status': {
                target: 'http://10.0.237.108:80'
            },
            // '/rtt/status': {
            //     target: 'http://10.0.237.108:80'
            // },
        },
        hot: "only"
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'static/index.html' }],
        }),
        new CleanWebpackPlugin(),
        new ReactRefreshWebpackPlugin()
    ]
};