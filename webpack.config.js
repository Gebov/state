const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: {
        app: './index.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    externals: {
        "@angular/core": {
            commonjs: "@angular/core",
            commonjs2: "@angular/core"
        },
        "rxjs": {
            commonjs: "rxjs",
            commonjs2: "rxjs"
        },
        "tslib": {
            commonjs: "tslib",
            commonjs2: "tslib"
        },
    },
    plugins: [
        new CheckerPlugin()
    ]
};
