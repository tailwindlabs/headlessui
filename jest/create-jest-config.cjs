module.exports = function createJestConfig(root, options) {
  return Object.assign(
    {
      rootDir: root,
      setupFilesAfterEnv: ['<rootDir>../../jest/custom-matchers.ts'],
      transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
      },
    },
    options
  )
}
