<script>
import { ref, defineComponent, computed } from 'vue'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'

let everybody = [
  { id: 1, img: 'https://github.com/adamwathan.png', name: 'Adam Wathan' },
  { id: 2, img: 'https://github.com/sschoger.png', name: 'Steve Schoger' },
  { id: 3, img: 'https://github.com/bradlc.png', name: 'Brad Cornes' },
  { id: 4, img: 'https://github.com/simonswiss.png', name: 'Simon Vrachliotis' },
  { id: 5, img: 'https://github.com/robinmalfait.png', name: 'Robin Malfait' },
  {
    id: 6,
    img: 'https://pbs.twimg.com/profile_images/1478879681491394569/eV2PyCnm_400x400.jpg',
    name: 'James McDonald',
  },
  { id: 7, img: 'https://github.com/reinink.png', name: 'Jonathan Reinink' },
  { id: 8, img: 'https://github.com/thecrypticace.png', name: 'Jordan Pittman' },
]

export default defineComponent({
  components: {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxLabel,
    ComboboxOption,
    ComboboxOptions,
  },
  setup() {
    let query = ref('')
    let activePerson = ref(everybody[2])

    // Choose a random person on mount
    activePerson.value = everybody[Math.floor(Math.random() * everybody.length)]

    let people = computed(() => {
      return query.value === ''
        ? everybody
        : everybody.filter((person) =>
            person.name.toLowerCase().includes(query.value.toLowerCase())
          )
    })

    return {
      query,
      activePerson,
      people,

      displayValue: (item) => item?.name,
    }
  },
})
</script>

<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="mx-auto w-full max-w-lg">
      <div class="space-y-1">
        <Combobox
          as="div"
          v-model="activePerson"
          class="w-full overflow-hidden rounded border border-black/5 bg-white bg-clip-padding shadow-sm"
          v-slot="{ activeOption, open }"
        >
          <div class="flex w-full flex-col">
            <ComboboxInput
              @change="query = $event.target.value"
              class="w-full rounded-none border-none px-3 py-1 outline-none"
              placeholder="Search users…"
              :displayValue="displayValue"
            />
            <div
              :class="[
                'flex border-t',
                activePerson && !open ? 'border-transparent' : 'border-gray-200',
              ]"
            >
              <ComboboxOptions
                class="shadow-xs max-h-60 flex-1 overflow-auto py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
              >
                <ComboboxOption
                  v-for="person in people"
                  :key="person.id"
                  :value="person"
                  v-slot="{ active, selected }"
                >
                  <div
                    :class="[
                      'relative flex cursor-default select-none space-x-4 py-2 pl-3 pr-9 focus:outline-none',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                    ]"
                  >
                    <img :src="person.img" class="h-6 w-6 overflow-hidden rounded-full" />
                    <span :class="['block truncate', selected ? 'font-semibold' : 'font-normal']">
                      {{ person.name }}
                    </span>
                    <span
                      v-if="active"
                      :class="[
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                        active ? 'text-white' : 'text-indigo-600',
                      ]"
                    >
                      <svg class="h-5 w-5" viewBox="0 0 25 24" fill="none">
                        <path
                          d="M11.25 8.75L14.75 12L11.25 15.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </ComboboxOption>
              </ComboboxOptions>

              <div v-if="people.length === 0" class="w-full py-4 text-center">
                No person selected
              </div>
              <div v-else-if="activeOption" class="border-l">
                <div class="flex flex-col">
                  <div class="p-8 text-center">
                    <img
                      :src="activeOption.img"
                      class="mb-4 inline-block h-16 w-16 overflow-hidden rounded-full"
                    />
                    <div class="font-bold text-gray-900">{{ activeOption.name }}</div>
                    <div class="text-gray-700">Obviously cool person</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Combobox>
      </div>
    </div>
  </div>
</template>
