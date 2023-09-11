<template>
  <div class="flex h-full w-screen flex-col items-start space-y-12 bg-gray-50 p-12">
    <TabGroup class="flex w-full max-w-3xl flex-col" as="div">
      <TabList class="relative z-0 flex divide-x divide-gray-200 rounded-lg shadow">
        <Tab
          v-for="tab in tabs"
          :key="tab.name"
          class="group relative min-w-0 flex-1 overflow-hidden bg-white px-4 py-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
          v-slot="{ selected }"
        >
          <span>{{ tab.name }}</span>
          <small v-if="tab.disabled" class="inline-block px-4 text-xs">(disabled)</small>
          <span
            aria-hidden="true"
            class="absolute inset-x-0 bottom-0 h-0.5"
            :class="{ 'bg-indigo-500': selected, 'bg-transparent': !selected }"
          />
        </Tab>
      </TabList>

      <TabPanels class="mt-4">
        <TabPanel v-for="tab in tabs" class="rounded-lg bg-white p-4 shadow" :key="tab.name">
          {{ tab.content }}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let tabs = [
  { name: 'My Account', content: 'Tab content for my account' },
  { name: 'Company', content: 'Tab content for company' },
  { name: 'Team Members', content: 'Tab content for team members' },
  { name: 'Billing', content: 'Tab content for billing' },
]
</script>
