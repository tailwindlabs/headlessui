import { isIOS } from '../../utils/platform'
import { ScrollLockStep } from './overflow-store'

interface ContainerMetadata {
  containers: (() => HTMLElement[])[]
}

export function handleIOSLocking(): ScrollLockStep<ContainerMetadata> {
  if (!isIOS()) {
    return {}
  }

  let scrollPosition: number

  return {
    before() {
      scrollPosition = window.pageYOffset
    },

    after({ doc, d, meta }) {
      function inAllowedContainer(el: HTMLElement) {
        return meta.containers
          .flatMap((resolve) => resolve())
          .some((container) => container.contains(el))
      }

      d.style(doc.body, 'marginTop', `-${scrollPosition}px`)
      window.scrollTo(0, 0)

      // Relatively hacky, but if you click a link like `<a href="#foo">` in the Dialog, and there
      // exists an element on the page (outside of the Dialog) with that id, then the browser will
      // scroll to that position. However, this is not the case if the element we want to scroll to
      // is higher and the browser needs to scroll up, but it doesn't do that.
      //
      // Let's try and capture that element and store it, so that we can later scroll to it once the
      // Dialog closes.
      let scrollToElement: HTMLElement | null = null
      d.addEventListener(
        doc,
        'click',
        (e) => {
          if (!(e.target instanceof HTMLElement)) {
            return
          }

          try {
            let anchor = e.target.closest('a')
            if (!anchor) return
            let { hash } = new URL(anchor.href)
            let el = doc.querySelector(hash)
            if (el && !inAllowedContainer(el as HTMLElement)) {
              scrollToElement = el as HTMLElement
            }
          } catch (err) {}
        },
        true
      )

      d.addEventListener(
        doc,
        'touchmove',
        (e) => {
          // Check if we are scrolling inside any of the allowed containers, if not let's cancel the event!
          if (e.target instanceof HTMLElement && !inAllowedContainer(e.target as HTMLElement)) {
            e.preventDefault()
          }
        },
        { passive: false }
      )

      // Restore scroll position
      d.add(() => {
        // Before opening the Dialog, we capture the current pageYOffset, and offset the page with
        // this value so that we can also scroll to `(0, 0)`.
        //
        // If we want to restore a few things can happen:
        //
        // 1. The window.pageYOffset is still at 0, this means nothing happened, and we can safely
        // restore to the captured value earlier.
        // 2. The window.pageYOffset is **not** at 0. This means that something happened (e.g.: a
        // link was scrolled into view in the background). Ideally we want to restore to this _new_
        // position. To do this, we can take the new value into account with the captured value from
        // before.
        //
        // (Since the value of window.pageYOffset is 0 in the first case, we should be able to
        // always sum these values)
        window.scrollTo(0, window.pageYOffset + scrollPosition)

        // If we captured an element that should be scrolled to, then we can try to do that if the
        // element is still connected (aka, still in the DOM).
        if (scrollToElement && scrollToElement.isConnected) {
          scrollToElement.scrollIntoView({ block: 'nearest' })
          scrollToElement = null
        }
      })
    },
  }
}
