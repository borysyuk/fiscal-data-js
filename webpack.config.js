module.exports = {
  context: __dirname,
  entry: './index',
  devtool: "source-map",
  output: {
      path: __dirname + '/dist',
      filename: 'fiscalData.min.js',
      library: 'fiscalData'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  }
};
