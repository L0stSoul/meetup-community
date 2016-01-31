let Webpack = require('webpack');
let StatsPlugin = require('stats-webpack-plugin');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let HtmlWebpackPlugin = require('html-webpack-plugin');
let autoprefixer = require('autoprefixer');
let csswring = require('csswring');
let path = require('path');
let assetsPath = path.resolve('.', 'public', 'assets');
let mainEntryPath = path.resolve('.', 'frontend', 'app.js');
let indexTemplate = path.resolve('.', 'frontend/index.html');

export default function(appConfig, appPublicConfig = {}) {
  let isProd = appConfig.isProduction;
  let config = {
    devtool: isProd ? 'source-map' : 'eval',
    entry: isProd ? mainEntryPath : [
      'webpack/hot/dev-server',
      'webpack-dev-server/client?http://' + appConfig.host + ':' + (appConfig.port + 1),
      mainEntryPath
    ],
    output: {
      path: assetsPath,
      filename: 'bundle.js',
      publicPath: '/assets/'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015'],
            plugins: ['syntax-async-functions', 'transform-regenerator']
          }
        },
        {
          test: /\.css$/,
          loader: isProd ? ExtractTextPlugin.extract('css!postcss') : 'style!css!postcss'
        },
        {
          test: /\.less$/,
          loader: isProd ? ExtractTextPlugin.extract('css!postcss!less') : 'style!css!postcss!less'
        },
        {
          test: /\.html$/,
          loader: 'raw!html-minify-loader'
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          loaders: [
            'url?limit=100000!hash=sha512&digest=hex&name=[hash].[ext]',
            'image?bypassOnDebug&optimizationLevel=7&interlaced=false'
          ]
        }
      ]
    },
    
    postcss: isProd ? [autoprefixer, csswring] : [autoprefixer],

    'html-minify-loader': {
      empty: true,
      cdata: true,
      comments: false
    },

    plugins: [...(isProd
      ? [
      new ExtractTextPlugin("bundle.css"),
      new Webpack.optimize.UglifyJsPlugin({ minimize: true }),
      new StatsPlugin(path.join(__dirname, 'stats.json'), { chunkModules: true }),
    ] : [
      new Webpack.HotModuleReplacementPlugin(),
    ]),
      new HtmlWebpackPlugin({
        title: appConfig.title,
        filename: 'index.html',
        inject: true,
        template: indexTemplate,
        config: appPublicConfig
      })
    ]
  };

  return config;
};