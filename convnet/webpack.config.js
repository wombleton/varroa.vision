var path = require('path');

module.exports = {
  entry: {
    hellmurky: './hellmurky.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        loader: './loaders/data-loader',
        test: /-data\.txt$/
      },
      {
        loader: 'babel?presets=es2015',
        test: /\.js$/
      }
    ]
  }
};
