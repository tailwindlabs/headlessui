<template>
  <div class="flex h-full w-screen justify-center space-x-4 bg-gray-50 p-12">
    <div class="w-full max-w-4xl">
      <div class="space-y-1">
        <form @submit="onSubmit">
          <Combobox v-model="activePersons" name="people" multiple>
            <ComboboxLabel class="block text-sm font-medium leading-5 text-gray-700">
              Assigned to
            </ComboboxLabel>

            <div class="relative">
              <span class="inline-block w-full rounded-md shadow-sm">
                <div
                  class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-blue-700 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-700 sm:text-sm sm:leading-5"
                >
                  <span class="block flex flex-wrap gap-2">
                    <span v-if="activePersons.length === 0" class="p-0.5">Empty</span>
                    <span
                      v-for="person in activePersons"
                      :key="person.id"
                      class="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5"
                    >
                      <span>{{ person.name }}</span>
                      <svg
                        class="h-4 w-4 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        @click="removePerson(person)"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                    <ComboboxInput
                      @change="query = $event.target.value"
                      class="border-none p-0 focus:ring-0"
                      placeholder="Search..."
                    />
                  </span>
                  <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </ComboboxButton>
                </div>
              </span>

              <div class="absolute mt-1 w-full rounded-md bg-white shadow-lg">
                <ComboboxOptions
                  class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
                >
                  <ComboboxOption
                    v-for="person in people.filter((person) =>
                      person.name.toLowerCase().includes(query.toLowerCase())
                    )"
                    :key="person.id"
                    :value="person"
                    as="template"
                    v-slot="{ active, selected }"
                  >
                    <li
                      class="relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none"
                      :class="active ? 'bg-indigo-600 text-white' : 'text-gray-900'"
                    >
                      <span
                        class="block truncate"
                        :class="{ 'font-semibold': selected, 'font-normal': !selected }"
                      >
                        {{ person.name }}
                      </span>
                      <span
                        v-if="selected"
                        class="absolute inset-y-0 right-0 flex items-center pr-4"
                        :class="{ 'text-white': active, 'text-indigo-600': !active }"
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
          <button
            class="mt-2 inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  </div>
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

let people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
  { id: 7, name: 'Caroline Schultz' },
  { id: 8, name: 'Mason Heaney' },
  { id: 9, name: 'Claudie Smitham' },
  { id: 10, name: 'Emil Schaefer' },
]

let activePersons = ref([people[2], people[3]])

function onSubmit(e) {
  e.preventDefault()
  console.log([...new FormData(e.currentTarget).entries()])
}

function removePerson() {
  e.stopPropagation()
  e.preventDefault()
  activePersons.value = activePersons.value.filter((p) => p !== person)
}
</script>
