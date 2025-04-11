<template>
  <button
    type="button"
    class="focus:outline-hidden ui-focus-visible:ring-2 ui-focus-visible:ring-offset-2 flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 ring-gray-500 ring-offset-gray-100"
    v-bind="$props"
  >
    <slot></slot>
  </button>
</template>
