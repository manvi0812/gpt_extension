const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
    mode: 'development', // Change to 'production' for production builds
    entry: './content.js', // Entry point for your extension's content script
    output: {
        filename: 'bundle.js', // Bundled output file
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Match JavaScript files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Use Babel to transpile
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js'], // Allow importing JavaScript files without specifying extensions
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                API_KEY: JSON.stringify(process.env.API_KEY), // Example: add your .env variables here
                // Add other variables as needed
            },
        }),
    ],
    devtool: 'inline-source-map',
};
