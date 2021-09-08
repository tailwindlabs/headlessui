
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./headlessui.cjs.production.min.js')
} else {
  module.exports = require('./headlessui.cjs.development.js')
}
