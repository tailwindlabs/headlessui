import { defineComponent, ref } from 'vue'
import { TransitionRoot, TransitionChild } from '@headlessui/vue'

export default defineComponent({
  props: {
    enterDuration: {
      type: Number,
      default: 0,
    },
    leaveDuration: {
      type: Number,
      default: 0,
    },
    withChildren: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const show = ref(false)

    return () => (
      <div>
        {/* Test Styles */}
        <style>{`
          .enter { transition-duration: ${props.enterDuration}ms; }
          .leave { transition-duration: ${props.leaveDuration}ms; }
          .invisible { opacity: 0%; }
          .visible { opacity: 100%; }
        `}</style>

        {/* Test Controls */}
        <button id="show" onClick={() => (show.value = true)}>
          Show
        </button>
        <button id="hide" onClick={() => (show.value = false)}>
          Hide
        </button>
        <button id="toggle" onClick={() => (show.value = !show.value)}>
          Toggle
        </button>

        <TransitionRoot
          show={show.value}
          enter="enter"
          enterFrom="invisible"
          enterTo="visible"
          leave="leave"
          leaveFrom="visible"
          leaveTo="invisible"
          dataTestId="root"
        >
          <div>
            <span>Hello 0</span>

            {props.withChildren && (
              <>
                <TransitionChild
                  enter="enter"
                  enterFrom="invisible"
                  enterTo="visible"
                  leave="leave"
                  leaveFrom="visible"
                  leaveTo="invisible"
                  dataTestId="child-1"
                >
                  <span>Hello 1</span>
                </TransitionChild>

                <TransitionChild
                  enter="enter"
                  enterFrom="invisible"
                  enterTo="visible"
                  leave="leave"
                  leaveFrom="visible"
                  leaveTo="invisible"
                  dataTestId="child-2"
                >
                  <span>Hello 2</span>
                </TransitionChild>
              </>
            )}
          </div>
        </TransitionRoot>
      </div>
    )
  },
})
