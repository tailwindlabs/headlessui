<template>
  <div class="flex justify-center items-center space-x-12 p-12">
    <button>Previous</button>

    <PopoverGroup as="nav" ar-label="Mythical University" class="flex space-x-3">
      <Popover as="div" class="relative">
        <transition
          enter-active-class="transition ease-out duration-300 transform"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-300 transform"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <PopoverOverlay
            class="bg-opacity-75 bg-gray-500 fixed inset-0 z-20"
          ></PopoverOverlay>
        </transition>

        <PopoverButton
          class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900 relative z-30"
          >Normal</PopoverButton
        >
        <PopoverPanel class="absolute flex flex-col w-64 bg-gray-100 border-2 border-blue-900 z-30">
          <a
            v-for="(link, i) of links"
            :hidden="i === 2"
            href="/"
            class="px-3 py-2 border-2 border-transparent hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:border-blue-900"
          >
            Normal - {{ link }}
          </a>
        </PopoverPanel>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
          >Focus</PopoverButton
        >
        <PopoverPanel
          focus
          class="absolute flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
        >
          <a
            v-for="(link, i) of links"
            href="/"
            class="px-3 py-2 border-2 border-transparent hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:border-blue-900"
          >
            Focus - {{ link }}
          </a>
        </PopoverPanel>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          ref="trigger1"
          class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
          >Portal</PopoverButton
        >
        <Portal>
          <PopoverPanel
            ref="container1"
            class="flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
          >
            <a
              v-for="(link, i) of links"
              href="/"
              class="px-3 py-2 border-2 border-transparent hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:border-blue-900"
            >
              Portal - {{ link }}
            </a>
          </PopoverPanel>
        </Portal>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          ref="trigger2"
          class="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
          >Focus in portal</PopoverButton
        >
        <Portal>
          <PopoverPanel
            ref="container2"
            focus
            class="flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
          >
            <a
              v-for="(link, i) of links"
              href="/"
              class="px-3 py-2 border-2 border-transparent hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:border-blue-900"
            >
              Focus in Portal - {{ link }}
            </a>
          </PopoverPanel>
        </Portal>
      </Popover>
    </PopoverGroup>

    <button>Next</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import {
  Popover,
  PopoverOverlay,
  PopoverPanel,
  PopoverGroup,
  PopoverButton,
  Portal,
} from '@headlessui/vue'
import { usePopper } from '../../playground-utils/hooks/use-popper'

function html(templates) {
  return templates.join('')
}

export default {
  components: {
    Popover,
    PopoverPanel,
    PopoverOverlay,
    PopoverGroup,
    PopoverButton,
    Portal,
  },
  setup() {
    let links = ['First', 'Second', 'Third', 'Fourth']

    let [trigger1, container1] = usePopper({
      placement: 'bottom-start',
      strategy: 'fixed',
    })

    let [trigger2, container2] = usePopper({
      placement: 'bottom-start',
      strategy: 'fixed',
    })

    return { links, trigger1, container1, trigger2, container2 }
  },
}
</script>
