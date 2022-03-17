#!/usr/bin/env node

let fs = require('fs')
let path = require('path')
let fastGlob = require('fast-glob')

console.time('Rewrote imports in')
fastGlob.sync([process.argv.slice(2).join('')]).forEach((file) => {
  file = path.resolve(process.cwd(), file)
  let content = fs.readFileSync(file, 'utf8')
  let result = content.replace(/from([^"']*?)(["'])\.(.*?)\2/g, 'from$1".$3.js"')
  if (result !== content) {
    fs.writeFileSync(file, result, 'utf8')
  }
})
console.timeEnd('Rewrote imports in')
