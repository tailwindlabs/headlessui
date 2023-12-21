let path = require('path')
let { execSync } = require('child_process')

// Given a version, figure out what the release channel is so that we can publish to the correct
// channel on npm.
//
// E.g.:
//
//   1.2.3                  -> latest (default)
//   0.0.0-insiders.ffaa88  -> insiders
//   4.1.0-alpha.4          -> alpha

let tag = process.argv[2] || execSync(`git describe --tags --abbrev=0`).toString().trim()
let pkgPath = path.resolve(
  __dirname,
  '..',
  'packages',
  tag.slice(0, tag.indexOf('@', 1)).replace('/', '-')
)

let version = require(path.resolve(pkgPath, 'package.json')).version

let match = /\d+\.\d+\.\d+-(.*)\.\d+/g.exec(version)
if (match) {
  // We want to release alpha to the next channel because it will be the next version
  if (match[1] === 'alpha') match[1] = 'next'
  console.log(match[1])
} else {
  console.log('latest')
}
