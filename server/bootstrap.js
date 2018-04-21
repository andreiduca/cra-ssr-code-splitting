require('ignore-styles');
require('url-loader');
require('file-loader');
require('babel-register')({
    ignore: [ /(node_modules)/ ],
    presets: ['es2015', 'react-app'],
    plugins: [
        'syntax-dynamic-import',
        'dynamic-import-node',
        'react-loadable/babel'
    ]
});
require('./index');
