const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './client/index.tsx',
    output: {
      path: path.join(__dirname, '/dist/client'),
      // publicPath: '/',
      filename: 'bundle.js',
    },
    devtool: 'eval-source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/',
      },
      open: true,
      hot: true,
      compress: true,
      historyApiFallback: true,
      proxy: {
        '/api/**': 'http://localhost:3000'
  
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader', 
        },
        // {
        //   test: /\.scss$/,
        //   exclude: /node_modules/,
        //   use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        // },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './client/index.html',
      }),
      new ReactRefreshWebpackPlugin()

    //   new MiniCssExtractPlugin({
    //     filename: 'styles.css',
    //   }),
    ],
  };
  