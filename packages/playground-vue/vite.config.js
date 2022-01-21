import fs from 'fs'
import path from 'path'

import vue from '@vitejs/plugin-vue'

import routes from './src/routes.json'

function flatten(routes, resolver) {
  return routes
    .map((route) => (route.children ? flatten(route.children, resolver) : resolver(route)))
    .flat(Infinity)
}

let map = {}
let contents = flatten(routes, (route) => route.component)
  .map((path, i) => {
    let name = `Component$${i + 1}`
    map[path] = name
    return `import ${name} from ".${path}";`
  })
  .join('\n')

let location = path.resolve(__dirname, './src/.generated/preload.js')
let data = `${contents}\n\nexport default {\n${Object.entries(map)
  .map(([path, name]) => `  "${path}": ${name}`)
  .join(',\n')}\n}`

fs.writeFileSync(location, data, 'utf8')

export default {
  plugins: [vue()],
}
