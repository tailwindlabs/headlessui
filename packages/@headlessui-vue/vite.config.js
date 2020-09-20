const fs = require('fs')
const path = require('path')
const routes = require('./examples/src/routes')

function flatten(routes, resolver) {
  return routes
    .map(route => (route.children ? flatten(route.children, resolver) : resolver(route)))
    .flat(Infinity)
}

// This is a hack, but the idea is that we want to import all the examples from the routes.json
// file. However just doing dynamic imports() doesn't work well at build time. Therefore we will
// generate a fake file that contains them all.
let i = 0
const map = {}
const contents = flatten(routes, route => route.component)
  .map(path => {
    const name = `Component$${++i}`
    map[path] = name
    return `import ${name} from ".${path}";`
  })
  .join('\n')
fs.writeFileSync(
  path.resolve(__dirname, './examples/src/.generated/preload.js'),
  `${contents}\n\nexport default {\n${Object.entries(map)
    .map(([path, name]) => `  "${path}": ${name}`)
    .join(',\n')}\n}`,
  'utf8'
)

const TailwindUIPlugin = ({
  root, // project root directory, absolute path
  app, // Koa app instance
  server, // raw http server instance
  watcher, // chokidar file watcher instance
  resolver, // chokidar file watcher instance
}) => {
  const routePaths = flatten(routes, route => route.path)

  app.use(async (ctx, next) => {
    if (routePaths.includes(ctx.path)) {
      ctx.path = './index.html'
    }

    await next()
  })
}

module.exports = {
  alias: {
    '/@headlessui/vue/': path.resolve(__dirname, './src/index.ts'),
  },
  configureServer: [TailwindUIPlugin],
}
