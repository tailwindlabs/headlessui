<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="w-full max-w-xs mx-auto">
      <main>
        <aside ref="container" id="group-1">
          A
        </aside>

        <PortalGroup :target="container">
          <section id="group-2">
            <span>B</span>
          </section>
          <Portal>Next to A</Portal>
        </PortalGroup>

        <Portal>I am in the portal root</Portal>
      </main>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
import { Portal, PortalGroup } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { Portal, PortalGroup },
  setup(props, context) {
    let container = ref(null)
    return { container }
  },
}
</script>
