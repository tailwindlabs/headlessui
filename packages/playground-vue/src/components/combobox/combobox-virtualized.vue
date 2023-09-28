<template>
  <div className="flex flex-col p-12">
    <label class="mx-auto flex w-24 items-center gap-2">
      <span>Items:</span>
      <select v-model="count" class="mx-auto">
        <option :value="100">100</option>
        <option :value="1_000">1000</option>
        <option :value="10_000">10k</option>
        <option :value="100_000">100k</option>
      </select>
    </label>
    <div class="flex">
      <Example :data="list" initial="Europe/Brussels #1" :virtual="true" />
      <Example :data="list" initial="Europe/Brussels #1" :virtual="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { timezones as _allTimezones } from '../../data'
import Example from './_virtual-example.vue'

let count = ref(1_000)
let list = computed(() => {
  console.time('Generating list')
  let result = []

  while (result.length < Number(count.value)) {
    let batch = Math.floor(result.length / _allTimezones.length) + 1
    result.push(`${_allTimezones[result.length % _allTimezones.length]} #${batch}`)
  }
  console.timeEnd('Generating list')

  return result
})
</script>
