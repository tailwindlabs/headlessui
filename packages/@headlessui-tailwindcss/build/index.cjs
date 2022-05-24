'use strict'

let plugin =
  process.env.NODE_ENV === 'production'
    ? require('./headlessui.prod.cjs')
    : require('./headlessui.dev.cjs')

module.exports = (plugin.__esModule ? plugin : { default: plugin }).default
