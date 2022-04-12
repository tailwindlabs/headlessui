let create = require('../../jest/create-jest-config.cjs')
module.exports = create(__dirname, {
  displayName: 'React',
  setupFilesAfterEnv: ['./jest.setup.js'],
})
