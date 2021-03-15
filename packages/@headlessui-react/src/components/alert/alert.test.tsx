import React from 'react'
import { render } from '@testing-library/react'
import { getByText } from '../../test-utils/accessibility-assertions'

import { Alert } from './alert'

describe('Rendering', () => {
  it('should be possible to render an Alert', () => {
    render(<Alert>This is an alert</Alert>)

    expect(getByText('This is an alert')).toHaveAttribute('role', 'status')
  })

  it('should be possible to render an Alert using a render prop', () => {
    render(<Alert>{() => 'This is an alert'}</Alert>)

    expect(getByText('This is an alert')).toHaveAttribute('role', 'status')
  })

  it('should be possible to render an Alert with an explicit level of importance (polite)', () => {
    render(<Alert importance="polite">This is a polite message</Alert>)

    expect(getByText('This is a polite message')).toHaveAttribute('role', 'status')
  })

  it('should be possible to render an Alert with an explicit level of importance (assertive)', () => {
    render(<Alert importance="assertive">This is a assertive message</Alert>)

    expect(getByText('This is a assertive message')).toHaveAttribute('role', 'alert')
  })
})
