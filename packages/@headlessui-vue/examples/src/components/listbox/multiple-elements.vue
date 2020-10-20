<template>
  <div class="flex justify-center w-screen h-full p-12 space-x-4 bg-gray-50">
    <div class="w-64">
      <div class="space-y-1">
        <Listbox v-model="active">
          <ListboxLabel class="block text-sm font-medium leading-5 text-gray-700"
            >Assigned to</ListboxLabel
          >

          <div class="relative">
            <span class="inline-block w-full rounded-md shadow-sm">
              <ListboxButton
                class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <span class="block truncate">{{ active.name }}</span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    class="w-5 h-5 text-gray-400"
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

            <div class="absolute w-full mt-1 bg-white rounded-md shadow-lg">
              <ListboxOptions
                class="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
              >
                <ListboxOption
                  v-for="person in people"
                  :key="person.id"
                  :value="person"
                  :className="resolveListboxOptionClassName"
                  v-slot="{ active, selected }"
                >
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
                    <svg class="w-5 h-5" viewbox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </div>
        </Listbox>
      </div>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium leading-5 text-gray-700">
        Email
      </label>
      <div class="relative mt-1 rounded-md shadow-sm">
        <input
          class="block w-full form-input sm:text-sm sm:leading-5"
          placeholder="you@example.com"
        />
      </div>
    </div>

    <div class="w-64">
      <div class="space-y-1">
        <Listbox v-model="active">
          <ListboxLabel class="block text-sm font-medium leading-5 text-gray-700"
            >Assigned to</ListboxLabel
          >

          <div class="relative">
            <span class="inline-block w-full rounded-md shadow-sm">
              <ListboxButton
                class="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5"
              >
                <span class="block truncate">{{ active.name }}</span>
                <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    class="w-5 h-5 text-gray-400"
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

            <div class="absolute w-full mt-1 bg-white rounded-md shadow-lg">
              <ListboxOptions
                class="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5"
              >
                <ListboxOption
                  v-for="person in people"
                  :key="person.id"
                  :value="person"
                  :className="resolveListboxOptionClassName"
                  v-slot="{ active, selected }"
                >
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
                    <svg class="w-5 h-5" viewbox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
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
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
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
    const people = [
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

    const active = ref(people[Math.floor(Math.random() * people.length)])

    return {
      people,
      active,
      classNames,
      resolveListboxOptionClassName({ active }) {
        return classNames(
          'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
          active ? 'text-white bg-indigo-600' : 'text-gray-900'
        )
      },
    }
  },
}
</script>
