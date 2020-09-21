const fs = require('fs')
const path = require('path')

const prettier = require('prettier')
const Prism = require('prismjs')
require('prismjs/plugins/custom-class/prism-custom-class')

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

// ---

function pipe(...fns) {
  return fns.reduceRight((f, g) => (...args) => f(g(...args)), fns.pop())
}

Prism.plugins.customClass.map({
  tag: 'text-code-red',
  'attr-name': 'text-code-yellow',
  'attr-value': 'text-code-green',
  deleted: 'text-code-red',
  inserted: 'text-code-green',
  punctuation: 'text-code-white',
  keyword: 'text-code-purple',
  string: 'text-code-green',
  function: 'text-code-blue',
  boolean: 'text-code-red',
  comment: 'text-gray-400 italic',
})

const sourcePipeline = pipe(
  path => fs.readFileSync(path, 'utf8'),
  contents => prettier.format(contents, { parser: 'vue', printWidth: 100 }),
  contents => Prism.highlight(contents, Prism.languages.markup),
  contents =>
    [
      '<pre class="language-vue rounded-md bg-gray-800 py-3 px-4 overflow-x-auto">',
      '<code class="language-vue text-gray-200">',
      contents,
      '</code>',
      '</pre>',
    ].join('')
)

const skipRoutes = ['/']
const source = Object.assign(
  {},
  ...flatten(routes, route => ({
    urlPath: route.path,
    sourcePath: route.component,
  }))
    .filter(({ urlPath }) => !skipRoutes.includes(urlPath))
    .map(({ urlPath, sourcePath }) => ({
      [urlPath]: sourcePipeline(path.resolve(__dirname, 'examples', 'src', sourcePath), 'utf8'),
    }))
)
fs.writeFileSync(
  path.resolve(__dirname, './examples/src/.generated/source.json'),
  JSON.stringify(source, null, 2),
  'utf8'
)
// ---

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
    [process.env.NODE_ENV === 'production' ? '@headlessui/vue' : '/@headlessui/vue/']: path.resolve(
      __dirname,
      './src/index.ts'
    ),
  },
  configureServer: [TailwindUIPlugin],
}
