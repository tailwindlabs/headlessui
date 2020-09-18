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
    </main>
  </div>
</template>

<script>
import KeyCaster from './KeyCaster.vue'
import './.generated/preload.js'

export default {
  name: 'App',
  components: {
    KeyCaster,
  },
}
</script>
