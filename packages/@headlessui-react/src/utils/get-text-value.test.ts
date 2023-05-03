import { getTextValue } from './get-text-value'

let html = String.raw

it('should be possible to get the text value from an element', () => {
  let element = document.createElement('div')
  element.innerText = 'Hello World'
  expect(getTextValue(element)).toEqual('Hello World')
})

it('should strip out emojis when receiving the text from the element', () => {
  let element = document.createElement('div')
  element.innerText = '🇨🇦 Canada'
  expect(getTextValue(element)).toEqual('Canada')
})

it('should strip out hidden elements', () => {
  let element = document.createElement('div')
  element.innerHTML = html`<div><span hidden>Hello</span> world</div>`
  expect(getTextValue(element)).toEqual('world')
})

it('should strip out aria-hidden elements', () => {
  let element = document.createElement('div')
  element.innerHTML = html`<div><span aria-hidden>Hello</span> world</div>`
  expect(getTextValue(element)).toEqual('world')
})

it('should strip out role="img" elements', () => {
  let element = document.createElement('div')
  element.innerHTML = html`<div><span role="img">°</span> world</div>`
  expect(getTextValue(element)).toEqual('world')
})

it('should be possible to get the text value from the aria-label', () => {
  let element = document.createElement('div')
  element.setAttribute('aria-label', 'Hello World')
  expect(getTextValue(element)).toEqual('Hello World')
})

it('should be possible to get the text value from the aria-label (even if there is content)', () => {
  let element = document.createElement('div')
  element.setAttribute('aria-label', 'Hello World')
  element.innerHTML = 'Hello Universe'
  element.innerText = 'Hello Universe'
  expect(getTextValue(element)).toEqual('Hello World')
})

it('should be possible to get the text value from the element referenced by aria-labelledby (using `aria-label`)', () => {
  document.body.innerHTML = html`
    <div>
      <div id="foo" aria-labelledby="bar">Contents of foo</div>
      <div id="bar" aria-label="Actual value of bar">Contents of bar</div>
    </div>
  `

  expect(getTextValue(document.querySelector('#foo')!)).toEqual('Actual value of bar')
})

it('should be possible to get the text value from the element referenced by aria-labelledby (using its contents)', () => {
  document.body.innerHTML = html`
    <div>
      <div id="foo" aria-labelledby="bar">Contents of foo</div>
      <div id="bar">Contents of bar</div>
    </div>
  `

  expect(getTextValue(document.querySelector('#foo')!)).toEqual('Contents of bar')
})

it('should be possible to get the text value from the element referenced by aria-labelledby (using `aria-label`, multiple)', () => {
  document.body.innerHTML = html`
    <div>
      <div id="foo" aria-labelledby="bar baz">Contents of foo</div>
      <div id="bar" aria-label="Actual value of bar">Contents of bar</div>
      <div id="baz" aria-label="Actual value of baz">Contents of baz</div>
    </div>
  `

  expect(getTextValue(document.querySelector('#foo')!)).toEqual(
    'Actual value of bar, Actual value of baz'
  )
})

it('should be possible to get the text value from the element referenced by aria-labelledby (using its contents, multiple)', () => {
  document.body.innerHTML = html`
    <div>
      <div id="foo" aria-labelledby="bar baz">Contents of foo</div>
      <div id="bar">Contents of bar</div>
      <div id="baz">Contents of baz</div>
    </div>
  `

  expect(getTextValue(document.querySelector('#foo')!)).toEqual('Contents of bar, Contents of baz')
})
