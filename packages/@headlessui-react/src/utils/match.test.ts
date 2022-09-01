import { match } from './match'

describe('match', () => {
  it.each([
    {
      key: 'a',
      lookup: {
        a: true,
        b: false,
      },
      expected: true,
    },
    {
      key: 'b',
      lookup: {
        a: true,
        b: false,
      },
      expected: false,
    },
  ])('should return matched value', ({ key, lookup, expected }) => {
    const value = key === 'a' ? 'a' : 'b'
    expect(match(value, lookup)).toBe(expected)
  })

  it('should call matched function', () => {
    const mockFunctionA = jest.fn()
    const mockFunctionB = jest.fn()

    const value = true ? 'a' : 'b'
    match(value, {
      a: mockFunctionA,
      b: mockFunctionB,
    })

    expect(mockFunctionA).toBeCalled()
    expect(mockFunctionB).not.toBeCalled()
  })
})
