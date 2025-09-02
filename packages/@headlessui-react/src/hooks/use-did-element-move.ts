import { useState } from 'react'

function getViewportXY(element: HTMLElement) {
  let rect = element.getBoundingClientRect()
  return { x: rect.x, y: rect.top }
}

// Use case: when you have an open dropdown that uses the transition prop, if
// the user tabs to a different element causing the page to scroll a bit, then
// we want the dropdown to close immediately without transitions.
//
// Otherwise, the positioned dropdown will still be rendered while the
// transition is fading out resulting in unexpected UX.
//
// E.g.: Visit https://catalyst.tailwindui.com/docs/dropdown
//
// Scenario 1: The button didn't move
//
// 1. Open the dropdown
// 2. Press Escape
// 3. Dropdown closes with subtle fade out
//
// Scenario 2: The button did move
//
// 1. Open the dropdown
// 2. Press Tab
// 3. Dropdown closes immediately without a transition
//
// It's a bit of a weird hook because we want to capture the position of the
// element before we start caring about whether it moved or not.
//
// Once an element moved, we keep considering it "moved" until the `enabled`
// flag is turned off again.
//
export function useDidElementMove(enabled: boolean, element: HTMLElement | null) {
  let [previousXY, setPreviousXY] = useState<{ x: number; y: number } | null>(null)
  let [moved, setMoved] = useState(false)

  // Track the element position before we are interested in knowing if it was moved.
  if (!enabled && element) {
    let xy = getViewportXY(element)
    if (previousXY === null || previousXY.x !== xy.x || previousXY.y !== xy.y) {
      setPreviousXY(xy)
    }
  }

  // Clear the position if we no longer have an element.
  else if (!element && previousXY) {
    setPreviousXY(null)
  }

  // Reset moved state when the hook is not enabled anymore
  if (!enabled && moved) {
    setMoved(false)
  }

  // No element, no move
  if (!element) return false

  // Not enabled, no move
  if (!enabled) return false

  // No position to compare against, no move
  if (previousXY === null) return false

  // If the element is focused, then we assume the user is interacting with it
  // and we don't want to consider it "moved", otherwise animations might be
  // killed prematurely.
  if (element === document.activeElement) return false

  // Once moved, always moved until we reset the state
  if (moved) return true

  // Compare current position with the previous one. If we detect a change, we
  // mark it as moved.
  let currentXY = getViewportXY(element)
  let didButtonMove = currentXY.x !== previousXY.x || currentXY.y !== previousXY.y
  if (didButtonMove) setMoved(true)

  return didButtonMove
}
