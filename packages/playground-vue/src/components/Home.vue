<script setup>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

let Examples = defineComponent({
  props: ['routes'],
  setup:
    (props, { slots }) =>
    () =>
      slots.default({ routes: props.routes, slots }),
})

let router = useRouter()
let routes = router
  .getRoutes()
  .filter((example) => example.path !== '/')
  .filter((route) => route.meta.isRoot)
</script>

<template>
  <div class="container mx-auto my-24">
    <div class="prose">
      <h2>Examples</h2>
      <Examples :routes="routes" v-slot="{ routes, slots }">
        <ul>
          <li v-for="{ children, meta, path } in routes">
            <template v-if="children.length > 0">
              <h3 class="text-xl">{{ meta.name }}</h3>
              <!-- This is a bit cursed but it works -->
              <component v-for="vnode in slots.default({ routes: children, slots })" :is="vnode" />
            </template>
            <template v-else>
              <router-link :key="path" :to="path">
                {{ meta.name }}
              </router-link>
            </template>
          </li>
        </ul>
      </Examples>
    </div>
  </div>
</template>
