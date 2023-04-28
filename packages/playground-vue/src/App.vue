<template>
  <router-view v-if="layout === 'raw'" />
  <Layout v-else>
    <router-view />
    <KeyCaster />
  </Layout>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import KeyCaster from './KeyCaster.vue'
import Layout from './Layout.vue'

export default {
  name: 'App',
  components: {
    Layout,
    KeyCaster,
  },

  setup() {
    let route = useRoute()
    let layout = computed(() => route.query['layout'] ?? 'full')

    return {
      layout,
    }
  },
}
</script>
