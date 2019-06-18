/**
 * webpack 基础配置
 * @author chenjialin
 */

'use strict';

process.noDeprecation = true;

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const extend = require('node.extend');
const config = require('./config');
const buildConfig = config.buildConfig;

let configFile = process.env.NODE_ENV !== 'development' ? 'config.js' : 'config.dev.js';

const htmlWebpackPluginConfig = {
  inject: false,
  alwaysWriteToDisk: true,
  excludeChunks: /null/,
};

let resolveModules = [path.join(__dirname, '../node_modules'), path.join(config.paths.projectPath, 'node_modules')];

if (process.env.isACT) {
  resolveModules.push(path.join(config.paths.projectPath, '../../node_modules'));
  resolveModules.push(path.join(config.paths.cmsPath, 'node_modules'));
}

let basePlugins = [
  // 暂时不使用 ModuleConcatenationPlugin 作用域提升插件, 因为会对 webpack dev 模式造成影响
  // new webpack.optimize.ModuleConcatenationPlugin(),
  new ExtractTextPlugin({
    filename: buildConfig.outputNamingPattern === 'hash' ? '[name]-[contenthash:8].css' : '[name].css',
    allChunks: true,
  }),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.DefinePlugin({
    'process.env': {
      STATIC_FILES_HOST: '"' + config.paths.staticFilesHost + '"',
      ASSETS_URL: '"' + config.paths.assetsURL + '"',
      DEPLOY_TAG: '"' + config.deployTag + '"',
      NODE_ENV: config.isProduction ? '"production"' : '"development"',
    },
  }),
];

if (buildConfig.entry.vendor) {
  basePlugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      /**
       * 因为此项项目除了 vendor 入口外，只有 app 入口，所以此参数暂时无效。
       * 如果除了 vendor 外有多个入口，那么多个入口中引用 2 次以上（也就是说至少有两个入口引用了同一个模块）的模块会被打包到 vendor 里
       * @see https://segmentfault.com/a/1190000006808865#articleHeader5
       * @type {Number}
       */
      minChunks: 2, // 提取使用 2 次以上的模块，打包到 vendor 里
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'z-mainifest',
      chunks: ['vendor'],
    })
  );
}

if (buildConfig.injectAllFiles) {
  basePlugins.push(
    new HtmlWebpackPlugin(
      extend(
        {
          template: buildConfig.injectAllFiles.template || config.inject.defaultInjectAllTPL,
          filename: buildConfig.injectAllFiles.target || config.inject.defaultInjectAllTarget,
        },
        htmlWebpackPluginConfig
      )
    )
  );
}
if (buildConfig.injectStylesFiles) {
  basePlugins.push(
    new HtmlWebpackPlugin(
      extend(
        {
          template: buildConfig.injectStylesFiles.template || config.inject.defaultInjectStylesTPL,
          filename: buildConfig.injectStylesFiles.target || config.inject.defaultInjectStylesTarget,
        },
        htmlWebpackPluginConfig
      )
    )
  );
}
if (buildConfig.injectScriptsFiles) {
  basePlugins.push(
    new HtmlWebpackPlugin(
      extend(
        {
          template: buildConfig.injectScriptsFiles.template || config.inject.defaultInjectScriptsTPL,
          filename: buildConfig.injectScriptsFiles.target || config.inject.defaultInjectScriptsTarget,
        },
        htmlWebpackPluginConfig
      )
    )
  );
}

let babelLoaderOptions = {
  babelrc: false,
  presets: [[require.resolve('babel-preset-env'), { modules: false }], require.resolve('babel-preset-stage-2')],
  plugins: [require.resolve('babel-plugin-transform-runtime')],
};

// dev 和 prod 环境公共配置
let baseWebpackConfig = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: babelLoaderOptions,
          },
        ],
        exclude: /node_modules(?!(\/|\\)fe-core)/,
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                scss: ExtractTextPlugin.extract({
                  fallback: 'vue-style-loader',
                  use: [
                    {
                      loader: 'css-loader',
                      options: {
                        sourceMap: true,
                        url: false,
                      },
                    },
                    {
                      loader: 'postcss-loader',
                      options: {
                        sourceMap: true,
                        config: path.join(process.env.feBuildPath, 'postcss.config.js'),
                      },
                    },
                    {
                      loader: 'sass-loader',
                      options: {
                        sourceMap: true,
                        data:
                          '$ASSETS_URL: "' +
                          config.paths.assetsURL +
                          '"; $STATIC_FILES_HOST: "' +
                          config.paths.staticFilesHost +
                          '"; $DEPLOY_TAG: "' +
                          config.deployTag +
                          '";',
                      },
                    },
                  ],
                }),
                js: {
                  loader: 'babel-loader',
                  options: babelLoaderOptions,
                },
              },
            },
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                config: path.join(process.env.feBuildPath, 'postcss.config.js'),
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                data:
                  '$ASSETS_URL: "' +
                  config.paths.assetsURL +
                  '"; $STATIC_FILES_HOST: "' +
                  config.paths.staticFilesHost +
                  '"; $DEPLOY_TAG: "' +
                  config.deployTag +
                  '";',
              },
            },
            {
              loader: 'import-glob-loader',
            },
          ],
        }),
      },
      {
        test: /\.art$/,
        use: [
          {
            loader: 'art-template-loader',
          },
        ],
      },
    ],
  },
  resolveLoader: {
    modules: resolveModules,
  },
  resolve: {
    extensions: ['.js', '.vue'],
    modules: resolveModules,
    alias: {
      js: path.join(config.paths.src, 'js'),
      scss: path.join(config.paths.src, 'scss'),
      tpl: path.join(config.paths.src, 'tpl'),
      common: path.join(config.paths.src, 'js/common'),
      component: path.join(config.paths.src, 'js/component'),
      page: path.join(config.paths.src, 'js/page'),
      vendor: path.join(config.paths.src, 'vendor'),
      'v-component': path.join(config.paths.src, 'js/v-component'),
      'v-components': path.join(config.paths.src, 'js/v-components'), // 暂时兼容旧版项目
      'v-directive': path.join(config.paths.src, 'js/v-directive'),
      'v-filter': path.join(config.paths.src, 'js/v-filter'),
      'v-mixin': path.join(config.paths.src, 'js/v-mixin'),
      'v-plugin': path.join(config.paths.src, 'js/v-plugin'),
      'v-store': path.join(config.paths.src, 'js/v-store'),
      'site-config': path.join(config.paths.src, 'js/common/' + configFile),
      'build-util': path.join(__dirname, '../common/util.js'),
    },
  },
  entry: buildConfig.entry,
  output: {
    filename:
      buildConfig.outputNamingPattern === 'hash'
        ? '[name]-[' + (config.isProduction ? 'chunkhash' : 'hash') + ':8].js'
        : '[name].js',
    chunkFilename: 'chunk-[chunkhash:8].js',
    path: config.paths.dist,
    publicPath: config.paths.publicPath,
  },
  plugins: basePlugins,

  stats: {
    hash: false,
    version: true,
    timings: true,
    assets: false,
    chunks: true,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: false,
    publicPath: false,
  },
};

if (buildConfig.library) {
  baseWebpackConfig.output.library = buildConfig.library;
  baseWebpackConfig.output.libraryTarget = 'umd';
  baseWebpackConfig.output.libraryExport = 'default';
}

module.exports = baseWebpackConfig;
