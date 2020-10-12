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
      moduleNameMapper: {
        '^@headlessui/tests$': '<rootDir>../../packages/@headlessui-tests/src',
        '^@headlessui/react$': '<rootDir>../../packages/@headlessui-react/src',
        '^@headlessui/vue$': '<rootDir>../../packages/@headlessui-vue/src',
      },
    },
    options
  )
}
