import { createWebHistory, createRouter, RouterView } from 'vue-router'
import lookup from './.generated/preload.js'
import routes from './routes.json'

function buildRoutes(routes) {
  return routes.map((route) => {
    let definition = {
      path: route.path,
      component: route.component ? lookup[route.component] : RouterView,
    }

    if (route.children) {
      definition.children = buildRoutes(route.children)
    }

    return definition
  })
}

export default createRouter({
  history: createWebHistory(),
  routes: buildRoutes(routes),
})
