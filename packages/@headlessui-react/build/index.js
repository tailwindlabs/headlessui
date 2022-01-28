'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./headlessui.prod.cjs.js')
} else {
  module.exports = require('./headlessui.dev.cjs.js')
}
