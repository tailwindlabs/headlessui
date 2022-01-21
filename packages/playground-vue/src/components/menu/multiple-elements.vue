<template>
  <div class="flex justify-center w-screen h-full p-12 space-x-4 bg-gray-50">
    <div class="relative inline-block text-left">
      <Menu>
        <span class="rounded-md shadow-sm">
          <MenuButton
            class="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
          >
            <span>Options</span>
            <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </MenuButton>
        </span>

        <MenuItems
          class="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
        >
          <div class="px-4 py-3">
            <p class="text-sm leading-5">Signed in as</p>
            <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
          </div>

          <div class="py-1">
            <MenuItem as="a" :className="resolveClass" href="#account-settings"
              >Account settings</MenuItem
            >
            <MenuItem as="a" :className="resolveClass" href="#support">Support</MenuItem>
            <MenuItem as="a" :className="resolveClass" disabled href="#new-feature"
              >New feature (soon)</MenuItem
            >
            <MenuItem as="a" :className="resolveClass" href="#license">License</MenuItem>
          </div>
          <div class="py-1">
            <MenuItem as="a" :className="resolveClass" href="#sign-out">Sign out</MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>

    <div>
      <div class="relative rounded-md shadow-sm">
        <input
          class="block w-full form-input sm:text-sm sm:leading-5"
          placeholder="you@example.com"
        />
      </div>
    </div>

    <div class="relative inline-block text-left">
      <Menu>
        <span class="rounded-md shadow-sm">
          <MenuButton
            class="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
          >
            <span>Options</span>
            <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </MenuButton>
        </span>

        <MenuItems
          class="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
        >
          <div class="px-4 py-3">
            <p class="text-sm leading-5">Signed in as</p>
            <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
          </div>

          <div class="py-1">
            <MenuItem as="a" :className="resolveClass" href="#account-settings"
              >Account settings</MenuItem
            >
            <MenuItem as="a" :className="resolveClass" href="#support">Support</MenuItem>
            <MenuItem as="a" :className="resolveClass" disabled href="#new-feature"
              >New feature (soon)</MenuItem
            >
            <MenuItem as="a" :className="resolveClass" href="#license">License</MenuItem>
          </div>
          <div class="py-1">
            <MenuItem as="a" :className="resolveClass" href="#sign-out">Sign out</MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  </div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default {
  components: {
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
  },
  setup() {
    return {
      resolveClass({ active, disabled }) {
        return classNames(
          'block w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
          active && 'bg-gray-100 text-gray-900',
          disabled && 'cursor-not-allowed opacity-50'
        )
      },
    }
  },
}
</script>
