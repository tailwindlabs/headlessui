<template>
  <div class="flex h-full w-screen items-start justify-center bg-gray-50 p-12">
    <SwitchGroup as="div" class="flex items-center space-x-4">
      <SwitchLabel>Enable notifications</SwitchLabel>

      <Switch
        as="button"
        v-model="state"
        :class="resolveSwitchClass({ checked: state })"
        v-slot="{ checked }"
      >
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"
          :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }"
        />
      </Switch>
    </SwitchGroup>
  </div>
</template>

<script>
import { ref } from 'vue'
import { SwitchGroup, Switch, SwitchLabel } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { SwitchGroup, Switch, SwitchLabel },
  setup() {
    let state = ref(false)

    return {
      state,
      resolveSwitchClass({ checked }) {
        return classNames(
          'focus:shadow-outline relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          checked ? 'bg-indigo-600 hover:bg-indigo-800' : 'bg-gray-200 hover:bg-gray-400'
        )
      },
    }
  },
}
</script>
