<template>
  <Combobox v-model="value" v-slot="{ open }">
    <ComboboxInput :displayValue="(person) => displayValue(person, open)" />

    <ComboboxButton> Button </ComboboxButton>

    <ComboboxOptions>
      <ComboboxOption value="alice">alice</ComboboxOption>
      <ComboboxOption value="bob">bob</ComboboxOption>
      <ComboboxOption value="charlie">charlie</ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>

<script setup>
import { ref } from 'vue'
import {
  Combobox,
  ComboboxLabel,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let query = ref('')

let people = ['alice', 'bob', 'charlie']

let value = ref('bob')
function displayValue(person, open) {
  return `${person ?? ''} - ${open ? 'open' : 'closed'}`
}
</script>
