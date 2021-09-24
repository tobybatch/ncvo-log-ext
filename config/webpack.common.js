'use strict';

const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const PATHS = require('./paths');

const common = {
    mode: 'development',
    output: {
        // the build folder to output bundles and assets in.
        path: PATHS.build,
        // the filename template for entry chunks
        filename: '[name].js',
    },
    devtool: 'source-map',
    stats: {
        all: false,
        errors: true,
        builtAt: true,
    },
    module: {
        rules: [
            // Help webpack in understanding CSS files imported in .js files
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            // Check for images imported in .js files and
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images',
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        // hot reload
        new ExtensionReloader({
            port: 9090,
            reloadPage: true,
            entries: {
                contentScript: 'content',
                background: 'background',
                'content-script': 'content'
            }
        }),
        // Print file sizes
        new SizePlugin(),
        // Copy static assets from `public` folder to `build` folder
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: '**/*',
                    context: 'public',
                },
            ]
        }),
        // Extract CSS into separate files
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
};

module.exports = common;
