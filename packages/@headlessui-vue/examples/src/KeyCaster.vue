<template>
  <div
    class="fixed z-50 px-4 py-2 overflow-hidden text-2xl tracking-wide text-blue-100 bg-blue-800 rounded-md shadow cursor-default pointer-events-none select-none right-4 bottom-4"
    v-if="keys.length > 0"
  >
    {{
      keys
        .slice()
        .reverse()
        .join(' ')
    }}
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

const isMac = navigator.userAgent.indexOf('Mac OS X') !== -1

const KeyDisplay = isMac
  ? {
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Home: '↖',
      End: '↘',
      Alt: '⌥',
      CapsLock: '⇪',
      Meta: '⌘',
      Shift: '⇧',
      Control: '⌃',
      Backspace: '⌫',
      Delete: '⌦',
      Enter: '↵',
      Escape: '⎋',
      Tab: '⇥',
      ShiftTab: '⇤',
      PageUp: '⇞',
      PageDown: '⇟',
      ' ': '␣',
    }
  : {
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Meta: 'Win',
      Control: 'Ctrl',
      Backspace: '⌫',
      Delete: 'Del',
      Escape: 'Esc',
      PageUp: 'PgUp',
      PageDown: 'PgDn',
      ' ': '␣',
    }

export default defineComponent({
  setup() {
    const keys = ref([])

    window.addEventListener('keydown', event => {
      keys.value.unshift(
        event.shiftKey && event.key !== 'Shift'
          ? KeyDisplay[`Shift${event.key}`] ?? event.key
          : KeyDisplay[event.key] ?? event.key
      )
      setTimeout(() => keys.value.pop(), 2000)
    })

    return { keys }
  },
})
</script>
