const path = require('path')

function relativeToPackage(configPath) {
  return path.resolve(process.cwd(), process.env.npm_package_repository_directory, configPath)
}

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest/custom-matchers.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsConfig: relativeToPackage('./tsconfig.tsdx.json'),
    },
  },
}
