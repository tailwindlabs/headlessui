<template>
  <div v-once ref="el">wrapper for {{ props.type }}</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import { useRoute } from 'vue-router'
import { createRenderer, Renderer } from './renderers'

let route = useRoute()
let el = ref<HTMLElement | null>(null)
let props = defineProps({
  component: {
    type: Function as PropType<() => any>,
    required: true,
  },
  type: {
    type: String as PropType<'react' | 'vue'>,
    required: true,
  },
})

let app: Renderer

onMounted(() => {
  app = createRenderer(props.type, el.value, props.component)
  app.render()
})

onBeforeUnmount(() => {
  // app.destroy()
})
</script>
