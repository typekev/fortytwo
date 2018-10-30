'use strict';
var nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    libraryTarget: 'this',
  },
  target: 'node',
  module: {
    rules: [],
  },
  resolve: {
    extensions: ['.js'],
  },
  externals: [nodeExternals()],
};
