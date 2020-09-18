const path = require('path')
const routes = require('./examples/src/routes')

function flattenPaths(routes) {
  return routes
    .map(route => (route.children ? flattenPaths(route.children) : route.path))
    .flat(Infinity)
}

const TailwindUIPlugin = ({
  root, // project root directory, absolute path
  app, // Koa app instance
  server, // raw http server instance
  watcher, // chokidar file watcher instance
  resolver, // chokidar file watcher instance
}) => {
  const routePaths = flattenPaths(routes)

  app.use(async (ctx, next) => {
    if (routePaths.includes(ctx.path)) {
      ctx.path = './index.html'
    }

    await next()
  })
}

module.exports = {
  alias: {
    '@headlessui/vue': path.resolve(__dirname, './src/index.ts'),
  },
  configureServer: [TailwindUIPlugin],
}
