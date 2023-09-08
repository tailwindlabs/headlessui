<template>
  <div class="flex">
    <Example :virtual="true" />
    <Example :virtual="false" />
  </div>
</template>

<script setup>
import Example from './_virtual-example.vue'
</script>
