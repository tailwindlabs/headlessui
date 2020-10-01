<template>
  <div class="flex items-start justify-center w-screen h-full p-12 bg-gray-50">
    <SwitchGroup as="div" class="flex items-center space-x-4">
      <SwitchLabel>Enable notifications</SwitchLabel>

      <Switch as="button" v-model="state" :className="resolveSwitchClass" v-slot="{ checked }">
        <span
          class="inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full"
          :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }"
        />
      </Switch>
    </SwitchGroup>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
import { SwitchGroup, Switch, SwitchLabel } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { SwitchGroup, Switch, SwitchLabel },
  setup(props, context) {
    const state = ref(false)

    return {
      state,
      resolveSwitchClass({ checked }) {
        return classNames(
          'relative inline-flex flex-shrink-0 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline',
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        )
      },
    }
  },
}
</script>
