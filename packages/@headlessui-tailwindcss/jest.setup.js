let prettier = require('prettier')

function format(input) {
  return prettier.format(input.replace(/\n/g, ''), {
    parser: 'css',
    printWidth: 100,
  })
}

expect.extend({
  // Compare two CSS strings with all whitespace removed
  // This is probably naive but it's fast and works well enough.
  toMatchFormattedCss(received = '', argument = '') {
    let options = {
      comment: 'stripped(received) === stripped(argument)',
      isNot: this.isNot,
      promise: this.promise,
    }

    let formattedReceived = format(received)
    let formattedArgument = format(argument)

    let pass = formattedReceived === formattedArgument

    let message = pass
      ? () => {
          return (
            this.utils.matcherHint('toMatchFormattedCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(formattedReceived)}\n` +
            `Received: ${this.utils.printReceived(formattedArgument)}`
          )
        }
      : () => {
          let actual = formattedReceived
          let expected = formattedArgument

          let diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toMatchFormattedCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
})
