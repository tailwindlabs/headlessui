<template>
  <div class="flex h-full w-screen flex-col items-start space-y-12 bg-gray-50 p-12">
    <SwitchGroup as="div" class="flex items-center space-x-4">
      <SwitchLabel>Manual keyboard activation</SwitchLabel>

      <Switch as="button" v-model="manual" :className="resolveSwitchClass" v-slot="{ checked }">
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"
          :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }"
        />
      </Switch>
    </SwitchGroup>

    <TabGroup class="flex w-full max-w-3xl flex-col" as="div" :manual="manual">
      <TabList class="relative z-0 flex divide-x divide-gray-200 rounded-lg shadow">
        <Tab
          v-for="(tab, tabIdx) in tabs"
          :key="tab.name"
          :disabled="tab.disabled"
          class="group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10"
          :class="{
            'text-gray-900': selected,
            'text-gray-500 hover:text-gray-700': !selected,
            'rounded-l-lg': tabIdx === 0,
            'rounded-r-lg': tabIdx === tabs.length - 1,
            'opacity-50': tab.disabled,
          }"
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
        <TabPanel v-for="tab in tabs" class="rounded-lg bg-white p-4 shadow" key="tab.name">
          {{ tab.content }}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
import {
  SwitchGroup,
  Switch,
  SwitchLabel,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let tabs = [
  { name: 'My Account', content: 'Tab content for my account' },
  { name: 'Company', content: 'Tab content for company', disabled: true },
  { name: 'Team Members', content: 'Tab content for team members' },
  { name: 'Billing', content: 'Tab content for billing' },
]

export default {
  components: { SwitchGroup, Switch, SwitchLabel, TabGroup, TabList, Tab, TabPanels, TabPanel },
  setup(props, context) {
    let manual = ref(false)

    return {
      tabs: ref(tabs),
      manual,
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
