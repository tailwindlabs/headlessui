import { render } from './vue-testing-library'

import { type, shift, Keys } from './interactions'
import { defineComponent, h } from 'vue'

type Events = 'onKeyDown' | 'onKeyUp' | 'onKeyPress' | 'onClick' | 'onBlur' | 'onFocus'
let events: Events[] = ['onKeyDown', 'onKeyUp', 'onKeyPress', 'onClick', 'onBlur', 'onFocus']

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = {}

  if (typeof input === 'string') {
    return render(defineComponent({ template: input, components: defaultComponents }))
  }

  return render(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    )
  )
}

type Args = [
  string | Partial<KeyboardEvent>,
  (string | Partial<KeyboardEvent | MouseEvent>)[],
  Set<Events>
]

function key(input: string | Partial<KeyboardEvent>): Partial<KeyboardEvent> {
  if (typeof input === 'string') return { key: input }
  return input
}

function event(
  input: string | Partial<KeyboardEvent | MouseEvent>,
  target?: string
): Partial<KeyboardEvent | MouseEvent> {
  let e = typeof input === 'string' ? { type: input } : input

  if (target) {
    Object.defineProperty(e, 'target', {
      configurable: false,
      enumerable: true,
      get() {
        return document.getElementById(target!)
      },
    })
  }

  return e
}

describe('Keyboard', () => {
  describe('type', () => {
    it.each<Args>([
      // Default - no cancellation
      ['a', ['keydown', 'keypress', 'keyup'], new Set()],
      [Keys.Space, ['keydown', 'keypress', 'keyup', 'click'], new Set()],
      [Keys.Enter, ['keydown', 'keypress', 'click', 'keyup'], new Set()],
      [
        Keys.Tab,
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'after'),
          event('keyup', 'after'),
        ],
        new Set(),
      ],
      [
        shift(Keys.Tab),
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'before'),
          event('keyup', 'before'),
        ],
        new Set(),
      ],

      // Canceling keydown
      ['a', ['keydown', 'keyup'], new Set<Events>(['onKeyDown'])],
      [Keys.Space, ['keydown', 'keyup'], new Set<Events>(['onKeyDown'])],
      [Keys.Enter, ['keydown', 'keyup'], new Set<Events>(['onKeyDown'])],
      [Keys.Tab, ['keydown', 'keyup'], new Set<Events>(['onKeyDown'])],
      [shift(Keys.Tab), ['keydown', 'keyup'], new Set<Events>(['onKeyDown'])],

      // Canceling keypress
      ['a', ['keydown', 'keypress', 'keyup'], new Set<Events>(['onKeyPress'])],
      [Keys.Space, ['keydown', 'keypress', 'keyup', 'click'], new Set<Events>(['onKeyPress'])],
      [Keys.Enter, ['keydown', 'keypress', 'keyup'], new Set<Events>(['onKeyPress'])],
      [
        Keys.Tab,
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'after'),
          event('keyup', 'after'),
        ],
        new Set<Events>(['onKeyPress']),
      ],
      [
        shift(Keys.Tab),
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'before'),
          event('keyup', 'before'),
        ],
        new Set<Events>(['onKeyPress']),
      ],

      // Canceling keyup
      ['a', ['keydown', 'keypress', 'keyup'], new Set<Events>(['onKeyUp'])],
      [Keys.Space, ['keydown', 'keypress', 'keyup'], new Set<Events>(['onKeyUp'])],
      [Keys.Enter, ['keydown', 'keypress', 'click', 'keyup'], new Set<Events>(['onKeyUp'])],
      [
        Keys.Tab,
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'after'),
          event('keyup', 'after'),
        ],
        new Set<Events>(['onKeyUp']),
      ],
      [
        shift(Keys.Tab),
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'before'),
          event('keyup', 'before'),
        ],
        new Set<Events>(['onKeyUp']),
      ],

      // Cancelling blur
      [
        Keys.Tab,
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'after'),
          event('keyup', 'after'),
        ],
        new Set<Events>(['onBlur']),
      ],
      [
        shift(Keys.Tab),
        [
          event('keydown', 'trigger'),
          event('blur', 'trigger'),
          event('focus', 'before'),
          event('keyup', 'before'),
        ],
        new Set<Events>(['onBlur']),
      ],
    ])('should fire the correct events %#', async (input, result, prevents) => {
      let fired: (KeyboardEvent | MouseEvent)[] = []

      let state = { readyToCapture: false }

      function createProps(id: string) {
        return events.reduce(
          (props, name) => {
            props[name] = (event: any) => {
              if (!state.readyToCapture) return
              if (prevents.has(name)) event.preventDefault()
              fired.push(event)
            }
            return props
          },
          { id }
        )
      }

      renderTemplate({
        template: `
          <div>
            <Button id="before">Before</Button>
            <Button id="trigger">Trigger</Button>
            <Button id="after">After</Button>
          </div>
        `,
        components: {
          Button: defineComponent({
            setup(_props, { slots, attrs }) {
              return () => {
                return h('button', createProps(attrs.id as string), slots.default())
              }
            },
          }),
        },
      })

      let trigger = document.getElementById('trigger')
      trigger?.focus()
      state.readyToCapture = true

      await type([key(input)])

      let expected = result.map(e => event(e))

      expect(fired.length).toEqual(result.length)

      for (let [idx, event] of fired.entries()) {
        for (let key in expected[idx]) {
          let _key = key as keyof (KeyboardEvent | MouseEvent)
          expect(event[_key]).toBe(expected[idx][_key])
        }
      }
    })
  })
})
