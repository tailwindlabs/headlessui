module.exports = function createJestConfig(root, options) {
  let { setupFilesAfterEnv = [], transform = {}, ...rest } = options
  return Object.assign(
    {
      rootDir: root,
      setupFilesAfterEnv: ['<rootDir>../../jest/custom-matchers.ts', ...setupFilesAfterEnv],
      transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
        ...transform,
      },
      globals: {
        __DEV__: true,
      },
    },
    rest
  )
}
