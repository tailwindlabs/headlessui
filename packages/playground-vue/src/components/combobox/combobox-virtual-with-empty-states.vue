<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Combobox,
  ComboboxLabel,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from '@headlessui/vue'

type Option = {
  name: string
  disabled: boolean
  empty?: boolean
}

let list = ref([
  { name: 'Alice', disabled: false },
  { name: 'Bob', disabled: false },
  { name: 'Charlie', disabled: false },
  { name: 'David', disabled: false },
  { name: 'Eve', disabled: false },
  { name: 'Fred', disabled: false },
  { name: 'George', disabled: false },
  { name: 'Helen', disabled: false },
  { name: 'Iris', disabled: false },
  { name: 'John', disabled: false },
  { name: 'Kate', disabled: false },
  { name: 'Linda', disabled: false },
  { name: 'Michael', disabled: false },
  { name: 'Nancy', disabled: false },
  { name: 'Oscar', disabled: true },
  { name: 'Peter', disabled: false },
  { name: 'Quentin', disabled: false },
  { name: 'Robert', disabled: false },
  { name: 'Sarah', disabled: false },
  { name: 'Thomas', disabled: false },
  { name: 'Ursula', disabled: false },
  { name: 'Victor', disabled: false },
  { name: 'Wendy', disabled: false },
  { name: 'Xavier', disabled: false },
  { name: 'Yvonne', disabled: false },
  { name: 'Zachary', disabled: false },
])

let emptyOption = { name: 'No results', disabled: true, empty: true }

let query = ref('')
let selectedPerson = ref<Option | null>(list.value[0])
let optionsRef = ref<HTMLUListElement | null>(null)

let filtered = computed(() => {
  return query.value === ''
    ? list.value
    : list.value.filter((item) => item.name.toLowerCase().includes(query.value.toLowerCase()))
})
</script>
<template>
  <div class="mx-auto max-w-fit">
    <div class="py-8 font-mono text-xs">Selected person: {{ selectedPerson?.name ?? 'N/A' }}</div>
    <Combobox
      :virtual="{
        options: filtered.length > 0 ? filtered : [emptyOption],
        disabled: (option) => option.disabled || option.empty,
      }"
      v-model="selectedPerson"
      @update:modelValue="() => (query = '')"
      nullable
      as="div"
    >
      <ComboboxLabel class="block text-sm font-medium leading-5 text-gray-700">
        Person
      </ComboboxLabel>

      <div class="relative">
        <span class="relative inline-flex flex-row overflow-hidden rounded-md border shadow-sm">
          <ComboboxInput
            @change="(e) => (query = e.target.value)"
            :displayValue="(option: Option | null) => option?.name ?? ''"
            class="border-none px-3 py-1 outline-none"
          />
          <ComboboxButton as="button">
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
            :ref="optionsRef"
            :class="[
              'shadow-xs max-h-60 rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5',
              filtered.length === 0 ? 'overflow-hidden' : 'overflow-auto',
            ]"
            v-slot="{ option }"
          >
            <template v-if="option.empty">
              <ComboboxOption
                :value="option"
                class="relative w-full cursor-default select-none px-3 py-2 text-center focus:outline-none"
                disabled
              >
                <div class="relative grid h-full grid-cols-1 grid-rows-1">
                  <div class="absolute inset-0">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="0.5"
                      stroke="currentColor"
                      class="-translate-y-1/4 text-gray-500/5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  </div>
                  <div
                    class="z-20 col-span-full col-start-1 row-span-full row-start-1 flex flex-col items-center justify-center p-8"
                  >
                    <h3 class="mx-2 mb-4 text-xl font-semibold text-gray-400">No people found</h3>
                  </div>
                </div>
              </ComboboxOption>
            </template>
            <template v-else>
              <ComboboxOption
                as="template"
                v-slot="{ active }"
                :disabled="option.disabled"
                :value="option"
              >
                <div
                  :class="[
                    'relative w-full cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                  ]"
                >
                  <span class="block truncate">
                    {{ option.name }}
                  </span>
                </div>
              </ComboboxOption>
            </template>
          </ComboboxOptions>
        </div>
      </div>
    </Combobox>
  </div>
</template>
