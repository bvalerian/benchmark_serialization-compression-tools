const path = require('path');

module.exports = {
    entry: './react.jsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/',
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                type: 'asset/resource',
            },
        ],
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        historyApiFallback: true,
        port: 8000,
        open: true,
    },
    mode: 'development',
    devtool: 'source-map',
};