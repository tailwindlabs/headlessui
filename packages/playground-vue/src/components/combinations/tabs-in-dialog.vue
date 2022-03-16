<template>
  <button @click="open = true">Open dialog</button>
  <Dialog :open="open" @close="open = false" class="fixed inset-0 grid place-content-center">
    <DialogOverlay class="fixed inset-0 bg-gray-500/70" />
    <div
      class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
    >
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <TabGroup>
          <TabList>
            <Tab class="px-3 py-2">Tab 1</Tab>
            <Tab class="px-3 py-2">Tab 2</Tab>
            <Tab class="px-3 py-2">Tab 3</Tab>
          </TabList>
          <TabPanels>
            <TabPanel class="px-3 py-2">Panel 1</TabPanel>
            <TabPanel class="px-3 py-2">Panel 2</TabPanel>
            <TabPanel class="px-3 py-2">Panel 3</TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Dialog, DialogOverlay, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

let open = ref(false)
</script>
