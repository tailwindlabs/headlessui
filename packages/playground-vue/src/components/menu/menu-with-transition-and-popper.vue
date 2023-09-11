<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="relative mt-64 inline-block text-left">
      <Menu>
        <span class="inline-flex rounded-md shadow-sm">
          <MenuButton
            ref="trigger"
            class="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-50 active:text-gray-800"
          >
            <span>Options</span>
            <svg class="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </MenuButton>
        </span>

        <div ref="container" class="w-56">
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="w-full divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none"
            >
              <div class="px-4 py-3">
                <p class="text-sm leading-5">Signed in as</p>
                <p class="truncate text-sm font-medium leading-5 text-gray-900">tom@example.com</p>
              </div>

              <div class="py-1">
                <MenuItem as="a" :className="resolveClass" href="#account-settings">
                  Account settings
                </MenuItem>
                <MenuItem v-slot="data">
                  <a href="#support" :class="resolveClass(data)">Support</a>
                </MenuItem>
                <MenuItem as="a" :className="resolveClass" disabled href="#new-feature">
                  New feature (soon)
                </MenuItem>
                <MenuItem as="a" :className="resolveClass" href="#license">License</MenuItem>
              </div>
              <div class="py-1">
                <MenuItem as="a" :className="resolveClass" href="#sign-out">Sign out</MenuItem>
              </div>
            </MenuItems>
          </transition>
        </div>
      </Menu>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref, onMounted, watchEffect, watch } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { usePopper } from '../../playground-utils/hooks/use-popper'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: { Menu, MenuButton, MenuItems, MenuItem },
  setup(props, context) {
    let [trigger, container] = usePopper({
      placement: 'bottom-end',
      strategy: 'fixed',
      modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
    })

    function resolveClass({ active, disabled }) {
      return classNames(
        'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left',
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
        disabled && 'cursor-not-allowed opacity-50'
      )
    }

    return {
      trigger,
      container,
      resolveClass,
    }
  },
}
</script>
