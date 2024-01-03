<template>
  <div class="max-w-xl p-12">
    <a href="/">Link before</a>
    <RadioGroup v-model="active">
      <fieldset class="space-y-4">
        <legend>
          <h2 class="text-xl">Privacy setting</h2>
        </legend>

        <div class="-space-y-px rounded-md bg-white">
          <RadioGroupOption
            v-for="({ id, name, description }, i) in access"
            :key="id"
            :value="id"
            v-slot="{ active, checked }"
            :className="
              ({ active }) =>
                classNames(
                  // Rounded corners
                  i === 0 && 'rounded-tl-md rounded-tr-md',
                  access.length - 1 === i && 'rounded-bl-md rounded-br-md',

                  // Shared
                  'relative border p-4 flex focus:outline-none',
                  active ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200'
                )
            "
          >
            <div class="flex w-full items-center justify-between">
              <div class="ml-3 flex cursor-pointer flex-col">
                <span
                  :class="[
                    'block text-sm font-medium leading-5',
                    active ? 'text-indigo-900' : 'text-gray-900',
                  ]"
                >
                  {{ name }}
                </span>
                <span
                  :class="['block text-sm leading-5', active ? 'text-indigo-700' : 'text-gray-500']"
                >
                  {{ description }}
                </span>
              </div>
              <div>
                <svg
                  v-if="checked"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  class="h-5 w-5 text-indigo-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </fieldset>
    </RadioGroup>
    <a href="/">Link after</a>
  </div>
</template>

<script>
import { ref } from 'vue'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean)
}

export default {
  components: { RadioGroup, RadioGroupOption },
  setup() {
    let active = ref()
    let access = ref([
      {
        id: 'access-1',
        name: 'Public access',
        description: 'This project would be available to anyone who has the link',
      },
      {
        id: 'access-2',
        name: 'Private to Project Members',
        description: 'Only members of this project would be able to access',
      },
      {
        id: 'access-3',
        name: 'Private to you',
        description: 'You are the only one able to access this project',
      },
    ])

    return { active, access, classNames }
  },
}
</script>
