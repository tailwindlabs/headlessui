// Assuming requestAnimationFrame is roughly 60 frames per second
const frame = 1000 / 60

const formatter = new Intl.NumberFormat('en')

expect.extend({
  toBeWithinRenderFrame(actual, expected) {
    const min = expected - frame
    const max = expected + frame

    const pass = actual >= min && actual <= max

    if (pass) {
      return {
        message: () =>
          `expected ${actual} not to be within range of a frame ${formatter.format(
            min
          )} - ${formatter.format(max)}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${actual} to be within range of a frame ${formatter.format(
            min
          )} - ${formatter.format(max)}`,
        pass: false,
      }
    }
  },
})
