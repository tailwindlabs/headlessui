import { objectToFormEntries } from './form'

it.each([
  [{ a: 'b' }, [['a', 'b']]],
  [
    [1, 2, 3],
    [
      ['0', '1'],
      ['1', '2'],
      ['2', '3'],
    ],
  ],
  [
    { id: 1, admin: true, name: { first: 'Jane', last: 'Doe', nickname: { preferred: 'JDoe' } } },
    [
      ['id', '1'],
      ['admin', '1'],
      ['name[first]', 'Jane'],
      ['name[last]', 'Doe'],
      ['name[nickname][preferred]', 'JDoe'],
    ],
  ],
])('should encode an input of %j to an form data output', (input, output) => {
  expect(objectToFormEntries(input)).toEqual(output)
})
