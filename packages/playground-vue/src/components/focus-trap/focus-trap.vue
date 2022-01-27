<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="mx-auto w-full max-w-xs">
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
