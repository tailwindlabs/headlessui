// Given a version, figure out what the release notes are so that we can use this to pre-fill the
// relase notes on a GitHub release for the current version.

let path = require('path')
let { execSync } = require('child_process')

let tag = process.argv[2] || execSync(`git describe --tags --abbrev=0`).toString().trim()
let pkgPath = path.resolve(
  __dirname,
  '..',
  'packages',
  tag.slice(0, tag.indexOf('@', 1)).replace('/', '-')
)

console.log('./' + path.relative(process.cwd(), pkgPath))
