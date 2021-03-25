const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BASE_PATH } = require('./config.js');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.join(__dirname, '/web'),
        publicPath: BASE_PATH,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|)$/,
                loader: 'url-loader?limit=200000'
              }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './web/index.html'
        })
    ],
    devtool: '#eval-source-map'
}