<template>
  <div class="py-8">
    <form
      class="mx-auto flex h-full max-w-4xl flex-col items-start justify-center gap-8 rounded-lg border bg-white p-6"
      @submit.prevent="submitForm"
    >
      <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(350px,1fr))] items-start gap-3">
        <Section title="Switch">
          <Section title="Single value">
            <SwitchGroup as="div" class="flex items-center justify-between space-x-4">
              <SwitchLabel>Enable notifications</SwitchLabel>

              <Switch
                :defaultChecked="true"
                name="notifications"
                class="ui-checked:bg-blue-600 ui-not-checked:bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  class="ui-checked:translate-x-5 ui-not-checked:translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white"
                />
              </Switch>
            </SwitchGroup>
          </Section>

          <Section title="Multiple values">
            <SwitchGroup as="div" class="flex items-center justify-between space-x-4">
              <SwitchLabel>Apple</SwitchLabel>

              <Switch
                name="fruit[]"
                value="apple"
                class="ui-checked:bg-blue-600 ui-not-checked:bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  class="ui-checked:translate-x-5 ui-not-checked:translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white"
                />
              </Switch>
            </SwitchGroup>

            <SwitchGroup as="div" class="flex items-center justify-between space-x-4">
              <SwitchLabel>Banana</SwitchLabel>
              <Switch
                name="fruit[]"
                value="banana"
                class="ui-checked:bg-blue-600 ui-not-checked:bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  class="ui-checked:translate-x-5 ui-not-checked:translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white"
                />
              </Switch>
            </SwitchGroup>
          </Section>
        </Section>
        <Section title="Radio Group">
          <RadioGroup defaultValue="sm" name="size">
            <div class="flex -space-x-px rounded-md bg-white">
              <RadioGroupOption
                v-for="size in sizes"
                :key="size"
                :value="size"
                class="ui-active:z-10 ui-active:border-blue-200 ui-active:bg-blue-50 ui-not-active:border-gray-200 relative flex w-20 border px-2 py-4 first:rounded-l-md last:rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div class="flex w-full items-center justify-between">
                  <div class="ml-3 flex cursor-pointer flex-col">
                    <span
                      class="ui-active:text-blue-900 ui-not-active:text-gray-900 block text-sm font-medium leading-5"
                    >
                      {{ size }}
                    </span>
                  </div>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      class="ui-checked:block ui-not-checked:hidden h-5 w-5 text-blue-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </RadioGroupOption>
            </div>
          </RadioGroup>
        </Section>
        <Section title="Listbox">
          <div class="w-full space-y-1">
            <Listbox name="person" :defaultValue="people[1]" v-slot="{ value }">
              <div class="relative">
                <span class="inline-block w-full rounded-md shadow-sm">
                  <ListboxButton
                    class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm sm:leading-5"
                  >
                    <span class="block truncate">{{ value?.name?.first }}</span>
                    <span
                      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                    >
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

                <div class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                  <ListboxOptions
                    class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5"
                  >
                    <ListboxOption
                      v-for="person in people"
                      :key="person.id"
                      :value="person"
                      class="ui-active:bg-blue-600 ui-active:text-white ui-not-active:text-gray-900 relative cursor-default select-none py-2 pl-3 pr-9"
                    >
                      <span
                        class="ui-selected:font-semibold ui-not-selected:font-normal block truncate"
                      >
                        {{ person.name.first }}
                      </span>
                      <span
                        class="ui-selected:block ui-not-selected:hidden ui-active:text-white ui-not-active:text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4"
                      >
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
        </Section>
        <Section title="Combobox">
          <div class="w-full space-y-1">
            <Combobox
              name="location"
              defaultValue="New York"
              @change="query = ''"
              v-slot="{ open, value }"
            >
              <div class="relative">
                <div class="flex w-full flex-col">
                  <ComboboxInput
                    @change="query = $event.target.value"
                    class="w-full rounded-md border-gray-300 bg-clip-padding px-3 py-1 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    placeholder="Search users..."
                  />
                  <div
                    class="flex border-t"
                    :class="[value && !open ? 'border-transparent' : 'border-gray-200']"
                  >
                    <div class="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                      <ComboboxOptions
                        class="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 sm:text-sm sm:leading-5"
                      >
                        <ComboboxOption
                          v-for="location in locations.filter((l) =>
                            l.toLowerCase().includes(query.toLowerCase())
                          )"
                          :key="location"
                          :value="location"
                          class="ui-active:bg-blue-600 ui-active:text-white ui-not-active:text-gray-900 relative flex cursor-default select-none space-x-4 py-2 pl-3 pr-9"
                        >
                          <span
                            class="ui-selected:font-semibold ui-not-selected:font-normal block truncate"
                          >
                            {{ location }}
                          </span>
                          <span
                            class="ui-active:block ui-not-active:hidden ui-active:text-white ui-not-active:text-blue-600 absolute inset-y-0 right-0 flex items-center pr-4"
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
                        </ComboboxOption>
                      </ComboboxOptions>
                    </div>
                  </div>
                </div>
              </div>
            </Combobox>
          </div>
        </Section>
      </div>

      <div class="space-x-4">
        <button
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm sm:leading-5"
        >
          Submit
        </button>

        <button
          type="reset"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm sm:leading-5"
        >
          Reset
        </button>
      </div>

      <div class="w-full border-t py-4">
        <span>Form data (entries):</span>
        <pre class="text-sm">{{ JSON.stringify([...result.entries()], null, 2) }}</pre>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Switch,
  SwitchLabel,
  SwitchGroup,
  RadioGroup,
  RadioGroupOption,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel,
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxLabel,
} from '@headlessui/vue'
let html = String.raw

let Section = {
  props: {
    title: { type: String, default: '' },
  },
  template: html`
    <fieldset class="rounded-lg border bg-gray-200/20 p-3">
      <legend class="rounded-md border bg-gray-100 px-2 text-sm uppercase">{{ title }}</legend>
      <div class="flex flex-col gap-3">
        <slot />
      </div>
    </fieldset>
  `,
}

function submitForm(event) {
  result.value = new FormData(event.currentTarget)
}

let sizes = ref(['xs', 'sm', 'md', 'lg', 'xl'])
let people = ref([
  { id: 1, name: { first: 'Alice' } },
  { id: 2, name: { first: 'Bob' } },
  { id: 3, name: { first: 'Charlie' } },
])
let locations = ref(['New York', 'London', 'Paris', 'Berlin'])

let result = ref(
  typeof window === 'undefined' || typeof document === 'undefined' ? [] : new FormData()
)

let query = ref('')
</script>
