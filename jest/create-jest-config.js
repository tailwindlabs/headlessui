const { createJestConfig: create } = require('tsdx/dist/createJestConfig')

module.exports = function createJestConfig(root, options) {
  return Object.assign(
    {},
    create(undefined, root),
    {
      rootDir: root,
      setupFilesAfterEnv: ['<rootDir>../../jest/custom-matchers.ts'],
      globals: {
        'ts-jest': {
          isolatedModules: true,
          tsConfig: '<rootDir>/tsconfig.tsdx.json',
        },
      },
    },
    options
  )
}
