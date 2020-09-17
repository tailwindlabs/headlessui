const globals = {
  vue: 'Vue',
}

module.exports = {
  rollup(config) {
    for (let key in globals) config.output.globals[key] = globals[key]
    return config
  },
}
