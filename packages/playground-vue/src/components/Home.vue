<template>
  <div class="container mx-auto my-24">
    <div class="prose">
      <h2>Examples</h2>
      <Examples :examples="examples">
        <slot></slot>
      </Examples>
    </div>
  </div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

let Examples = defineComponent({
  props: ['examples'],
  setup: (props) => () =>
    h(
      'ul',
      props.examples.map((example) =>
        h(
          'li',
          { key: example.path },
          example.children.length > 0
            ? h('h3', { class: 'text-xl' }, example.meta.name)
            : [h(RouterLink, { to: example.path }, () => example.meta.name)],
          example.children.length > 0 && h(Examples, { examples: example.children })
        )
      )
    ),
})

export default {
  components: { Examples },
  setup() {
    let router = useRouter()

    return {
      examples: router
        .getRoutes()
        .filter((example) => example.path !== '/')
        .filter((route) => route.meta.isRoot),
    }
  },
}
</script>
