<template>
  <div
    class="pointer-events-none fixed bottom-4 right-4 z-50 cursor-default select-none overflow-hidden rounded-md bg-blue-800 px-4 py-2 text-2xl tracking-wide text-blue-100 shadow"
    v-if="keys.length > 0"
  >
    {{ keys.slice().reverse().join(' ') }}
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

let isMac = navigator.userAgent.indexOf('Mac OS X') !== -1

let KeyDisplay = isMac
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
    let keys = ref([])

    window.addEventListener('keydown', (event) => {
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
