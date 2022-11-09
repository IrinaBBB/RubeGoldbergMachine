const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// Fra: https://threejs-journey.com/
module.exports = merge(
    commonConfiguration,
    {
        mode: 'production',
        plugins:
        [
            new CleanWebpackPlugin()
        ]
    }
)
