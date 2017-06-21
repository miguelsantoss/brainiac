'use strict'
const path = require('path')

module.exports = {
  port: 3000,
  title: 'Brainiac',
  publicPath: process.env.BUILD_DEMO ? '/react-semantic.ui-starter/' : '/',
  srcPath: path.join(__dirname, 'src/client'),
  // add these dependencies to a standalone vendor bundle
  vendor: [
    'react',
    'react-dom',
    'semantic-ui-react',
    'whatwg-fetch',
    'offline-plugin/runtime',
    'prop-types'
  ],
  // your web app's manifest.json
  manifest: {
    name: 'Brainiac',
    short_name: 'BRAIN',
    description: 'brainiac stuff',
    start_url: '.',
    display: 'standalone',
  }
}