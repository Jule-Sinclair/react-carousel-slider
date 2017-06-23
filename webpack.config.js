const webpack = require('webpack');

const src_path = `${__dirname}/src/js`;

const reactEntry = {
  index: `${src_path}/Index.jsx`,
};

const reactConfig = {
  output: {
    path: `${__dirname}/build/js/`,
    filename: '[name].js'
  },
  watch: true,
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        include: `${__dirname}/src/js`,
        query: {
          presets: ['es2015', 'react'],
          plugins: [
            ['transform-es2015-classes', {
              'loose': true
            }],
            ['transform-proto-to-assign']
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.es6']
  }
};

reactConfig.entry = reactEntry;

reactConfig.plugins = [
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
  }),
];

module.exports = () => ({ reactConfig });
