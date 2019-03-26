const path = require('path');

module.exports = {
  entry: './src/client/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      // query: {
      //   presets: ['env', 'react', 'stage-3'],
      // },
    }],
  },
  mode: 'development',
  devServer: {
    compress: true,
    port: 8080,
    disableHostCheck: true,
  },
};
