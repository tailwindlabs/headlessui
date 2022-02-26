<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="mx-auto w-full max-w-xs">
      <div class="space-y-1">
        <Listbox v-model="active">
          <ListboxLabel class="block text-sm font-medium leading-5 text-gray-700"
            >Assigned to</ListboxLabel
          >

          <div class="relative">
            <span class="inline-block w-full rounded-md shadow-sm">
              <ListboxButton
                class="focus:shadow-outline-blue relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
              >
                <span class="block truncate">{{ active.name }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
              </ListboxButton>
            </span>

            <div class="absolute mt-1 w-full rounded-md bg-white shadow-lg">
              <ListboxOptions
                class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
              >
                <ListboxOption
                  v-for="person in people"
                  :key="person.id"
                  :value="person"
                  as="template"
                  :disabled="person.disabled"
                  v-slot="{ active, selected }"
                >
                  <li :class="resolveListboxOptionClassName({ active, selected })">
                    <span
                      :class="
                        classNames('block truncate', selected ? 'font-semibold' : 'font-normal')
                      "
                    >
                      {{ person.name }}
                    </span>
                    <span
                      v-if="selected"
                      :class="
                        classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )
                      "
                    >
                      <svg class="h-5 w-5" viewbox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </div>
        </Listbox>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption },
  setup(props, context) {
    let people = [
      { id: 1, name: 'Wade Cooper' },
      { id: 2, name: 'Arlene Mccoy' },
      { id: 3, name: 'Devon Webb' },
      { id: 4, name: 'Tom Cook' },
      { id: 5, name: 'Tanya Fox', disabled: true },
      { id: 6, name: 'Hellen Schmidt' },
      { id: 7, name: 'Caroline Schultz' },
      { id: 8, name: 'Mason Heaney' },
      { id: 9, name: 'Claudie Smitham' },
      { id: 10, name: 'Emil Schaefer' },
    ]

    let active = ref(people[Math.floor(Math.random() * people.length)])

    return {
      people,
      active,
      classNames,
      resolveListboxOptionClassName({ active, disabled }) {
        return classNames(
          'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
          active ? 'text-white bg-indigo-600' : 'text-gray-900',
          disabled && 'bg-gray-50 text-gray-300'
        )
      },
    }
  },
}
</script>
