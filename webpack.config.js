const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('./config');
const _ = require('./utils');

const rootPath = path.resolve(__dirname);
const sourcePath = path.resolve(rootPath, 'src/client');
const distPath = path.resolve(rootPath, 'dist'); // eslint-disable-line no-unused-vars

const loaders = {
  style: { loader: 'style-loader' },
  css: { loader: 'css-loader', options: { sourceMap: true } },
  resolve: 'resolve-url-loader',
  postcss: {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
    },
  },
  sass: { loader: 'sass-loader', options: { sourceMap: true } },
};

module.exports = (env) => {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';

  const plugins = [];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      }),
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new FriendlyErrors(),
    );
  }

  plugins.push(
      new ExtractTextPlugin('styles.css'),
      new HtmlWebpackPlugin({
        title: config.title,
        template: path.resolve(sourcePath, 'index.html'),
        filename: _.outputIndexPath,
      }),
    );

  return {
    devtool: isProd ? 'source-map' : 'eval',
    entry: {
      client: path.join(sourcePath, 'index.js'),
    },
    output: {
      path: _.outputPath,
      filename: '[name].js',
      publicPath: config.publicPath,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: [/node_modules/],
        },
        {
          test: /\.css$/,
          loaders: [loaders.style, loaders.css, loaders.postcss, loaders.resolve],
        },
        {
          test: /\.scss$/,
          loaders: [
            loaders.style,
            loaders.css,
            loaders.postcss,
            loaders.resolve,
            loaders.sass,
          ],
        },
        {
          test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
          use: 'file-loader?limit=100000',
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            'file-loader?limit=100000',
            {
              loader: 'img-loader',
              options: {
                enabled: true,
                optipng: true,
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.css', '.scss', '.json'],
      modules: [
        path.resolve(rootPath, 'node_modules'),
      ],
      alias: {
        components: path.join(sourcePath, 'components'),
        containers: path.join(sourcePath, 'containers'),
        actions: path.join(sourcePath, 'actions'),
        reducers: path.join(sourcePath, 'reducers'),
        api: path.join(sourcePath, 'api'),
        lib: path.join(sourcePath, 'lib'),
        css: path.join(sourcePath, 'css'),
      },
    },

    plugins,

    performance: isProd && {
      maxAssetSize: 100,
      maxEntrypointSize: 300,
      hints: 'warning',
    },

    stats: {
      colors: {
        green: '\u001b[32m',
      },
    },

    devServer: {
      contentBase: 'distPath',
      historyApiFallback: true,
      port: 8081,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: {
          green: '\u001b[32m',
        },
      },
    },
  };
};
