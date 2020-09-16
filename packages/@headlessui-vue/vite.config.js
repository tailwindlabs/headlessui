const TailwindUIPlugin = ({
  root, // project root directory, absolute path
  app, // Koa app instance
  server, // raw http server instance
  watcher, // chokidar file watcher instance
  resolver, // chokidar file watcher instance
}) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/') ctx.path = '/examples'
    if (ctx.path.endsWith('@headlessui/vue')) {
      ctx.type = 'ts'
      ctx.path = '/src/index.ts'
    }

    await next()
  })
}

module.exports = {
  configureServer: [TailwindUIPlugin],
}
