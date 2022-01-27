<template>
  <div class="flex items-center justify-center space-x-12 p-12">
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
          <PopoverOverlay class="fixed inset-0 z-20 bg-gray-500 bg-opacity-75"></PopoverOverlay>
        </transition>

        <PopoverButton
          class="relative z-30 border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900 focus:outline-none"
          >Normal</PopoverButton
        >
        <PopoverPanel class="absolute z-30 flex w-64 flex-col border-2 border-blue-900 bg-gray-100">
          <a
            v-for="(link, i) of links"
            :hidden="i === 2"
            href="/"
            class="border-2 border-transparent px-3 py-2 hover:bg-gray-200 focus:border-blue-900 focus:bg-gray-200 focus:outline-none"
          >
            Normal - {{ link }}
          </a>
        </PopoverPanel>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          class="border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900 focus:outline-none"
          >Focus</PopoverButton
        >
        <PopoverPanel
          focus
          class="absolute flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
        >
          <a
            v-for="(link, i) of links"
            href="/"
            class="border-2 border-transparent px-3 py-2 hover:bg-gray-200 focus:border-blue-900 focus:bg-gray-200 focus:outline-none"
          >
            Focus - {{ link }}
          </a>
        </PopoverPanel>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          ref="trigger1"
          class="border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900 focus:outline-none"
          >Portal</PopoverButton
        >
        <Portal>
          <PopoverPanel
            ref="container1"
            class="flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
          >
            <a
              v-for="(link, i) of links"
              href="/"
              class="border-2 border-transparent px-3 py-2 hover:bg-gray-200 focus:border-blue-900 focus:bg-gray-200 focus:outline-none"
            >
              Portal - {{ link }}
            </a>
          </PopoverPanel>
        </Portal>
      </Popover>

      <Popover as="div" class="relative">
        <PopoverButton
          ref="trigger2"
          class="border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900 focus:outline-none"
          >Focus in portal</PopoverButton
        >
        <Portal>
          <PopoverPanel
            ref="container2"
            focus
            class="flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
          >
            <a
              v-for="(link, i) of links"
              href="/"
              class="border-2 border-transparent px-3 py-2 hover:bg-gray-200 focus:border-blue-900 focus:bg-gray-200 focus:outline-none"
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
