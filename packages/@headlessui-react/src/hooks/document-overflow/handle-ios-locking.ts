import { disposables } from '../../utils/disposables'
import { isIOS } from '../../utils/platform'
import type { ScrollLockStep } from './overflow-store'

interface ContainerMetadata {
  containers: (() => HTMLElement[])[]
}

export function handleIOSLocking(): ScrollLockStep<ContainerMetadata> {
  if (!isIOS()) {
    return {}
  }

  return {
    before({ doc, d, meta }) {
      function inAllowedContainer(el: HTMLElement) {
        return meta.containers
          .flatMap((resolve) => resolve())
          .some((container) => container.contains(el))
      }

      d.microTask(() => {
        // We need to be able to offset the body with the current scroll position. However, if you
        // have `scroll-behavior: smooth` set, then changing the scrollTop in any way shape or form
        // will trigger a "smooth" scroll and the new position would be incorrect.
        //
        // This is why we are forcing the `scroll-behaviour: auto` here, and then restoring it later.
        // We have to be a bit careful, because removing `scroll-behavior: auto` back to
        // `scroll-behavior: smooth` can start triggering smooth scrolling. Delaying this by a
        // microTask will guarantee that everything is done such that both enter/exit of the Dialog is
        // not using smooth scrolling.
        if (window.getComputedStyle(doc.documentElement).scrollBehavior !== 'auto') {
          let _d = disposables()
          _d.style(doc.documentElement, 'scrollBehavior', 'auto')
          d.add(() => d.microTask(() => _d.dispose()))
        }

        // Keep track of the current scroll position so that we can restore the scroll position if
        // it has changed in the meantime.
        let scrollPosition = window.scrollY ?? window.pageYOffset

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

        // Rely on overscrollBehavior to prevent scrolling outside of the Dialog.
        d.addEventListener(doc, 'touchstart', (e) => {
          if (e.target instanceof HTMLElement) {
            if (inAllowedContainer(e.target as HTMLElement)) {
              // Find the root of the allowed containers
              let rootContainer = e.target
              while (
                rootContainer.parentElement &&
                inAllowedContainer(rootContainer.parentElement)
              ) {
                rootContainer = rootContainer.parentElement!
              }

              d.style(rootContainer, 'overscrollBehavior', 'contain')
            } else {
              d.style(e.target, 'touchAction', 'none')
            }
          }
        })

        d.addEventListener(
          doc,
          'touchmove',
          (e) => {
            // Check if we are scrolling inside any of the allowed containers, if not let's cancel the event!
            if (e.target instanceof HTMLElement) {
              if (inAllowedContainer(e.target as HTMLElement)) {
                // Even if we are in an allowed container, on iOS the main page can still scroll, we
                // have to make sure that we `event.preventDefault()` this event to prevent that.
                //
                // However, if we happen to scroll on an element that is overflowing, or any of its
                // parents are overflowing, then we should not call `event.preventDefault()` because
                // otherwise we are preventing the user from scrolling inside that container which
                // is not what we want.
                let scrollableParent = e.target
                while (
                  scrollableParent.parentElement &&
                  // Assumption: We are always used in a Headless UI Portal. Once we reach the
                  // portal itself, we can stop crawling up the tree.
                  scrollableParent.dataset.headlessuiPortal !== ''
                ) {
                  // Check if the scrollable container is overflowing or not.
                  //
                  // NOTE: we could check the `overflow`, `overflow-y` and `overflow-x` properties
                  // but when there is no overflow happening then the `overscrollBehavior` doesn't
                  // seem to work and the main page will still scroll. So instead we check if the
                  // scrollable container is overflowing or not and use that heuristic instead.
                  if (
                    scrollableParent.scrollHeight > scrollableParent.clientHeight ||
                    scrollableParent.scrollWidth > scrollableParent.clientWidth
                  ) {
                    break
                  }

                  scrollableParent = scrollableParent.parentElement
                }

                // We crawled up the tree until the beginnging of the Portal, let's prevent the
                // event if this is the case. If not, then we are in a container where we are
                // allowed to scroll so we don't have to prevent the event.
                if (scrollableParent.dataset.headlessuiPortal === '') {
                  e.preventDefault()
                }
              }

              // We are not in an allowed container, so let's prevent the event.
              else {
                e.preventDefault()
              }
            }
          },
          { passive: false }
        )

        // Restore scroll position if a scrollToElement was captured.
        d.add(() => {
          let newScrollPosition = window.scrollY ?? window.pageYOffset

          // If the scroll position changed, then we can restore it to the previous value. This will
          // happen if you focus an input field and the browser scrolls for you.
          if (scrollPosition !== newScrollPosition) {
            window.scrollTo(0, scrollPosition)
          }

          // If we captured an element that should be scrolled to, then we can try to do that if the
          // element is still connected (aka, still in the DOM).
          if (scrollToElement && scrollToElement.isConnected) {
            scrollToElement.scrollIntoView({ block: 'nearest' })
            scrollToElement = null
          }
        })
      })
    },
  }
}
