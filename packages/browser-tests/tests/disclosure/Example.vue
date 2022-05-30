<template>
  <div>
    <Disclosure>
      <DisclosureButton :disabled="buttonDisabled">Trigger</DisclosureButton>
      <DisclosurePanel>
        <template v-if="buttonInside">
          <DisclosureButton>Close</DisclosureButton>
        </template>
        <template v-else> Content </template>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

defineProps({
  buttonDisabled: {
    type: Boolean,
    default: false,
  },

  buttonInside: {
    type: Boolean,
    default: false,
  },
})
</script>
