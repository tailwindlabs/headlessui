<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans antialiased text-gray-900 bg-white">
    <header
      class="relative z-10 flex items-center justify-between flex-shrink-0 px-4 py-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8"
    >
      <router-link to="/">
        <img
          class="w-auto h-6"
          src="https://tailwindui.com/img/tailwindui-logo.svg"
          alt="Tailwind UI"
        />
      </router-link>
    </header>
    <main class="flex-1 overflow-auto bg-gray-50">
      <router-view />
      <KeyCaster />

      <!-- TODO: Position this in the correct spot -->
      <div
        v-if="sourceCode"
        class="container fixed bottom-0 left-0 right-0 my-12 overflow-scroll rounded-md max-h-96"
        v-html="sourceCode"
      />
    </main>
  </div>
</template>

<script>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import KeyCaster from './KeyCaster.vue'
import './.generated/preload.js'
import source from './.generated/source.json'

export default {
  name: 'App',
  components: {
    KeyCaster,
  },
  setup() {
    const route = useRoute()
    const sourceCode = computed(() => source[route.path])

    return { sourceCode }
  },
}
</script>
