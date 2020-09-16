<template>
  <div class="flex flex-col h-screen overflow-hidden font-sans antialiased text-gray-900 bg-white">
    <header
      class="relative z-10 flex items-center justify-between flex-shrink-0 px-4 py-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8"
    >
      <a href="/">
        <img
          class="w-auto h-6"
          src="https://tailwindui.com/img/tailwindui-logo.svg"
          alt="Tailwind UI"
        />
      </a>
    </header>
    <main class="flex-1 overflow-auto bg-gray-50">
      <MenuWithPopper />
      <!-- <MenuWithTailwind /> -->
      <KeyCaster />
    </main>
  </div>
</template>

<script>
import KeyCaster from './KeyCaster.vue'
import MenuWithPopper from './components/menu-with-popper.vue'
import MenuWithTailwind from './components/menu-with-tailwind.vue'

export default {
  name: 'App',
  components: {
    MenuWithPopper,
    MenuWithTailwind,
    KeyCaster,
  },
}
</script>
