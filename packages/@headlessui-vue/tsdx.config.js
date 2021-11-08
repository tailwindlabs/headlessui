const globals = {
  vue: 'Vue',
}

module.exports = {
  rollup(config, opts) {
    for (let key in globals) config.output.globals[key] = globals[key]
    if (opts.format === 'esm') {
      config = { ...config, preserveModules: true }
      config.output = { ...config.output, dir: 'dist/', entryFileNames: '[name].esm.js' }
      delete config.output.file
    }
    return config
  },
}
