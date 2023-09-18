<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="mx-auto w-full max-w-xs">
      <div class="py-8 font-mono text-xs">Selected timezone: {{ activeTimezone }}</div>
      <div class="space-y-1">
        <Combobox nullable v-model="activeTimezone" as="div" :virtual="virtual">
          <ComboboxLabel class="block text-sm font-medium leading-5 text-gray-700">
            Timezone
            {{
              virtual
                ? `(virtual — ${nf.format(timezones.length)} items)`
                : `(${nf.format(timezones.length)} items)`
            }}
          </ComboboxLabel>

          <div class="relative">
            <span class="relative inline-flex flex-row overflow-hidden rounded-md border shadow-sm">
              <ComboboxInput
                @change="query = $event.target.value"
                class="border-none px-3 py-1 outline-none"
              />
              <ComboboxButton
                class="cursor-default border-l bg-gray-100 px-1 text-indigo-600 focus:outline-none"
              >
                <span class="pointer-events-none flex items-center px-2">
                  <svg
                    class="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </ComboboxButton>
            </span>

            <div class="absolute mt-1 w-full rounded-md bg-white shadow-lg">
              <ComboboxOptions
                v-if="!virtual"
                class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
              >
                <ComboboxOption
                  v-for="(timezone, idx) in timezones"
                  :key="timezone"
                  :value="timezone"
                  :order="virtual ? idx : undefined"
                  v-slot="{ active, selected }"
                  as="template"
                >
                  <li
                    :class="[
                      'relative w-full cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    ]"
                  >
                    <span :class="['block truncate', selected ? 'font-semibold' : 'font-normal']">
                      {{ timezone }}
                    </span>
                    <span
                      v-if="selected"
                      :class="[
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                        active ? 'text-white' : 'text-indigo-600',
                      ]"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
              <ComboboxOptions
                v-if="virtual"
                class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
                v-slot="{ option: timezone }"
              >
                <ComboboxOption :value="timezone" v-slot="{ active, selected }" as="template">
                  <li
                    :class="[
                      'relative w-full cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    ]"
                  >
                    <span :class="['block truncate', selected ? 'font-semibold' : 'font-normal']">
                      {{ timezone }}
                    </span>
                    <span
                      v-if="selected"
                      :class="[
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                        active ? 'text-white' : 'text-indigo-600',
                      ]"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </div>
          </div>
        </Combobox>
      </div>
    </div>
  </div>
</template>

<script setup>
let nf = new Intl.NumberFormat('en-US')
import { ref, computed } from 'vue'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'

let props = defineProps(['data', 'initial', 'virtual'])

let query = ref('')
let activeTimezone = ref(props.initial)
let timezones = computed(() => {
  return query.value === ''
    ? props.data
    : props.data.filter((timezone) => timezone.toLowerCase().includes(query.value.toLowerCase()))
})

let virtual = computed(() => {
  return props.virtual ? { options: timezones.value } : null
})
</script>
