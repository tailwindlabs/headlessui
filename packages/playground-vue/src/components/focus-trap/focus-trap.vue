<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="w-full max-w-xs mx-auto">
      <button>Previous</button>
      <FocusTrap>
        <button>Trigger</button>
      </FocusTrap>
      <button>After</button>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
import { FocusTrap } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { FocusTrap },
  setup(props, context) {
    return {}
  },
}
</script>
