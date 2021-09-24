'use strict';

const {merge} = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
    entry: {
        content: [
            PATHS.src + '/content.js',
            PATHS.src + '/footerFunctions.js',
            PATHS.src + '/loggerModalFunctions.js'
        ],
        options: PATHS.src + '/options.js'
    },
});

module.exports = config;
