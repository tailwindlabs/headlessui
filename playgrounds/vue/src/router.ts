import { createRouter, createWebHistory, RouterView } from 'vue-router'

type Component = import('vue').Component

function buildRoutes() {
  function titleCase(str) {
    return str
      .toLocaleLowerCase()
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // 1. Get all the components in the src/components directory
  let files = Object.entries(
    import.meta.glob('./components/**/*.vue', {
      eager: true,
      import: 'default',
    })
  ) as [string, Component][]

  // 2.a. Swap the file names for route urls
  // 2.b. Resolve the default import for each component
  files = files.map(([file, component]) => [
    file
      .replace('./components/', '/')
      .replace(/\.vue$/, '')
      .toLocaleLowerCase()
      .replace(/^\/home$/g, '/'),
    component,
  ])

  let alreadyAdded = new Set()

  // 3. Add a route for each directory (if not already added)
  files = files.flatMap((entry) => {
    let dirs = entry[0].split('/').slice(1, -1)

    let paths: [string, Component][] = []

    for (const [idx] of dirs.entries()) {
      let path = `/` + dirs.slice(0, idx + 1).join('/')
      if (alreadyAdded.has(path)) {
        continue
      }

      paths.push([path, RouterView])
      alreadyAdded.add(path)
    }

    return [...paths, entry]
  })

  // 4. Sort the routes alphabetically and by length
  files.sort((a, b) => a[0].localeCompare(b[0]))

  // 5. Create the nested routes
  let routes = []
  let routesByPath = {}

  for (let [path, component] of files) {
    let prefix = path.split('/').slice(0, -1).join('/')
    let parent = routesByPath[prefix]?.children ?? routes
    let route = {
      path,
      component: component,
      children: [],
      meta: {
        name: titleCase(path.match(/[^/]+$/)?.[0] ?? 'Home'),
        isRoot: parent === routes,
      },
    }

    parent.push((routesByPath[path] = route))
  }

  return routes
}

export default createRouter({
  history: createWebHistory(),
  routes: buildRoutes(),
})
