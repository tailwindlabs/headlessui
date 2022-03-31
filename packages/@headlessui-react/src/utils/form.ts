type Entries = [string, string][]

export function objectToFormEntries(
  source: Record<string, any> = {},
  parentKey: string | null = null,
  entries: Entries = []
): Entries {
  for (let [key, value] of Object.entries(source)) {
    append(entries, composeKey(parentKey, key), value)
  }

  return entries
}

function composeKey(parent: string | null, key: string): string {
  return parent ? parent + '[' + key + ']' : key
}

function append(entries: Entries, key: string, value: any): void {
  if (Array.isArray(value)) {
    for (let [subkey, subvalue] of value.entries()) {
      append(entries, composeKey(key, subkey.toString()), subvalue)
    }
  } else if (value instanceof Date) {
    entries.push([key, value.toISOString()])
  } else if (typeof value === 'boolean') {
    entries.push([key, value ? '1' : '0'])
  } else if (typeof value === 'string') {
    entries.push([key, value])
  } else if (typeof value === 'number') {
    entries.push([key, `${value}`])
  } else if (value === null || value === undefined) {
    entries.push([key, ''])
  } else {
    objectToFormEntries(value, key, entries)
  }
}

export function attemptSubmit(element: HTMLElement) {
  let form = (element as any)?.form ?? element.closest('form')
  if (!form) return

  for (let element of form.elements) {
    if (
      (element.tagName === 'INPUT' && element.type === 'submit') ||
      (element.tagName === 'BUTTON' && element.type === 'submit') ||
      (element.nodeName === 'INPUT' && element.type === 'image')
    ) {
      // If you press `enter` in a normal input[type='text'] field, then the form will submit by
      // searching for the a submit element and "click" it. We could also use the
      // `form.requestSubmit()` function, but this has a downside where an `event.preventDefault()`
      // inside a `click` listener on the submit button won't stop the form from submitting.
      element.click()
      return
    }
  }
}
