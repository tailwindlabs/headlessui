import { createWebHistory, createRouter, RouterView } from 'vue-router'

// import routes from './routes.json'

// TODO: build this using the routes - so that it works. Currently the vite build tool doesn't know
// what components to include because the budilRoutes() function uses dynamic imports.
const builtRoutes = [
  {
    path: '/',
    component: () => import('./components/Home.vue'),
  },
  {
    name: 'Menu',
    path: '/menu',
    component: RouterView,
    children: [
      {
        name: 'Menu with Popper',
        path: '/menu/menu-with-popper',
        component: () => import('./components/menu/menu-with-popper.vue'),
      },
      {
        name: 'Menu with Tailwind',
        path: '/menu/menu-with-tailwind',
        component: () => import('./components/menu/menu-with-tailwind.vue'),
      },
    ],
  },
]

// function buildRoutes(routes) {
//   return routes.map(route => {
//     const definition = {
//       path: route.path,
//       component: route.component ? () => import(route.component) : RouterView,
//     }

//     if (route.children) {
//       definition.children = buildRoutes(route.children)
//     }

//     return definition
//   })
// }

export default createRouter({
  history: createWebHistory(),
  routes: builtRoutes, // buildRoutes(routes),
})
