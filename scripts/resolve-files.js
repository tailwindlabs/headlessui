#!/usr/bin/env node
let fastGlob = require('fast-glob')

let parts = process.argv.slice(2)
let [args, flags] = parts.reduce(
  ([args, flags], part) => {
    if (part.startsWith('--')) {
      flags[part.slice(2, part.indexOf('='))] = part.slice(part.indexOf('=') + 1)
    } else {
      args.push(part)
    }
    return [args, flags]
  },
  [[], {}]
)

flags.ignore = flags.ignore ?? ''
flags.ignore = flags.ignore.split(',').filter(Boolean)

console.log(
  fastGlob
    .sync(args.join(''))
    .filter((file) => {
      for (let ignore of flags.ignore) {
        if (file.includes(ignore)) {
          return false
        }
      }
      return true
    })
    .join('\n')
)
