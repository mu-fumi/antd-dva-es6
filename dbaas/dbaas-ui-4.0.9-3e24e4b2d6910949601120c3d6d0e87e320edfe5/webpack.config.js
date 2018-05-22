/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-06-09 19:45 $
 */

const path = require('path');
const srcPath = path.join(__dirname, '/src');
const fs = require('fs')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackChunkHash = require('webpack-chunk-hash')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (config, env) {

  config.module.preLoaders = [
    {
      test: /\.(js|jsx)$/,
      include: srcPath,
      loader: 'proxy-polyfill'
    }
  ]
  config.module.loaders[0].exclude.push(/\.ejs$/)

  if (env === 'production') {
    config.output.filename = '[name].[chunkhash].js'
    config.output.chunkFilename = '[chunkhash].async.js'
    config.plugins[3] = new ExtractTextPlugin('[contenthash:20].css')
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: 'ejs!src/index.ejs',
        inject: true,
        minify: { collapseWhitespace: true },
        production: true,
      }),
      new WebpackChunkHash({ algorithm: 'md5' }),
      // new BundleAnalyzerPlugin()
    )
  } else {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: 'ejs!src/index.ejs',
        inject: true,
      }),
      // new BundleAnalyzerPlugin()
    )
  }
  return config
}
