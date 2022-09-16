// extra-webpack.config.js
const path = require('path');
module.exports = {
  resolve: {
    extensions: ['.js'],
    alias: {
      fs: path.resolve(__dirname, 'src/mocks/fs.mock.js'),
      child_process: path.resolve(
        __dirname,
        'src/mocks/child_process.mock.js'
      ),
      'https-proxy-agent': path.resolve(
        __dirname,
        'src/mocks/https-proxy-agent.mock.js',
      ),
    },
    fallback: {
        util: false,
        stream: false,
        crypto: false,
        path: false,
        querystring: false,
        os: false,
        url: false,
        https: false
    }
  },
};

