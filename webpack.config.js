const path = require('path');
const webpack = require('webpack')

module.exports = env => ({
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
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    },
    ],
  },
  mode: 'development',
  devServer: {
    compress: true,
    port: 8080,
    disableHostCheck: true,
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV', 'PORT']),
  ],
});
