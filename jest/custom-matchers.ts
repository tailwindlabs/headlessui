import '@testing-library/jest-dom/extend-expect'

// Assuming requestAnimationFrame is roughly 60 frames per second
const frame = 1000 / 60
const amountOfFrames = 2

const formatter = new Intl.NumberFormat('en')

expect.extend({
  toBeWithinRenderFrame(actual, expected) {
    const min = expected - frame * amountOfFrames
    const max = expected + frame * amountOfFrames

    const pass = actual >= min && actual <= max

    return {
      message: pass
        ? () => {
            return `expected ${actual} not to be within range of a frame ${formatter.format(
              min
            )} - ${formatter.format(max)}`
          }
        : () => {
            return `expected ${actual} not to be within range of a frame ${formatter.format(
              min
            )} - ${formatter.format(max)}`
          },
      pass,
    }
  },
})
