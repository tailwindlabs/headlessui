<template>
  <div class="flex h-full w-screen justify-center bg-gray-50 p-12">
    <div class="relative inline-block text-left">
      <Menu>
        <span class="rounded-md shadow-sm">
          <MenuButton
            class="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-50 active:text-gray-800"
          >
            <span>Options</span>
            <svg class="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </MenuButton>
        </span>

        <MenuItems
          class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none"
        >
          <div class="px-4 py-3">
            <p class="text-sm leading-5">Signed in as</p>
            <p class="truncate text-sm font-medium leading-5 text-gray-900">tom@example.com</p>
          </div>

          <div class="py-1">
            <CustomMenuItem href="#account-settings">Account settings</CustomMenuItem>
            <CustomMenuItem href="#support">Support</CustomMenuItem>
            <CustomMenuItem disabled href="#new-feature">New feature (soon)</CustomMenuItem>
            <CustomMenuItem href="#license">License</CustomMenuItem>
          </div>
          <div class="py-1">
            <CustomMenuItem href="#sign-out">Sign out</CustomMenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  </div>
</template>

<script>
import { defineComponent, h, ref, watchEffect } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let CustomMenuItem = defineComponent({
  components: { Menu, MenuButton, MenuItems, MenuItem },
  setup(props, { slots }) {
    return () => {
      return h(MenuItem, ({ active, disabled }) => {
        return h(
          'a',
          {
            class: classNames(
              'flex justify-between w-full text-left px-4 py-2 text-sm leading-5',
              active ? 'bg-indigo-500 text-white' : 'text-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            ),
          },
          [
            h('span', { class: classNames(active && 'font-bold') }, slots.default()),
            h('kbd', { class: classNames('font-sans', active && 'text-indigo-50') }, '⌘K'),
          ]
        )
      })
    }
  },
})

export default {
  components: {
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
    CustomMenuItem,
  },
}
</script>
