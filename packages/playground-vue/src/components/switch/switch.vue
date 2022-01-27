<template>
  <div class="flex h-full w-screen items-start justify-center bg-gray-50 p-12">
    <SwitchGroup as="div" class="flex items-center space-x-4">
      <SwitchLabel>Enable notifications</SwitchLabel>

      <Switch as="button" v-model="state" :className="resolveSwitchClass" v-slot="{ checked }">
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"
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
    let state = ref(false)

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
