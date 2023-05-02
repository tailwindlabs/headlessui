function getTextContents(element: HTMLElement): string {
  // Using innerText instad of textContent because:
  //
  // > textContent gets the content of all elements, including <script> and <style> elements. In
  // > contrast, innerText only shows "human-readable" elements.
  // >
  // > — https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext
  let value = element.innerText ?? ''

  // Check if it contains some emojis or not, if so, we need to remove them
  // because ideally we work with simple text values.

  // Ideally we can use the much simpler RegEx: /\p{Extended_Pictographic}/u
  // but we can't rely on this yet, so we use the more complex one.
  if (
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/.test(
      value
    )
  ) {
    value = value.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
  }

  // Remove all the elements that shouldn't be there.
  //
  // [hidden]       — The user doesn't see it
  // [aria-hidden]  — The screen reader doesn't see it
  // [role="img"]   — Even if it is text, it is used as an image
  //
  // This is probably the slowest part, but if you want complete control over the text value,
  // you better set an `aria-label` instead.
  let children = element.querySelectorAll('[hidden],[aria-hidden],[role="img"]')
  if (children.length > 0) {
    for (let el of children) {
      if (el instanceof HTMLElement) {
        value = value.replace(el.innerText ?? '', '')
      }
    }
  }

  return value
}

export function getTextValue(element: HTMLElement): string {
  // Try to use the `aria-label` first
  let label = element.getAttribute('aria-label')
  if (typeof label === 'string') return label.trim()

  // Try to use the `aria-labelledby` second
  let labelledby = element.getAttribute('aria-labelledby')
  if (labelledby) {
    let labelEl = document.getElementById(labelledby)
    if (labelEl) {
      let label = labelEl.getAttribute('aria-label')
      // Try to use the `aria-label` first (of the referenced element)
      if (typeof label === 'string') return label.trim()

      // This time, the `aria-labelledby` isn't used anymore (in Safari), so we just have to
      // look at the contents itself.
      return getTextContents(labelEl).trim()
    }
  }

  // Try to use the text contents of the element itself
  return getTextContents(element).trim()
}
