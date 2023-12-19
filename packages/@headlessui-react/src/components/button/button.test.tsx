import { render, screen } from '@testing-library/react'
import React from 'react'
import { Button } from './button'

describe('Rendering', () => {
  describe('Button', () => {
    it('should render a button', async () => {
      render(<Button>My Button</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should default to `type="button"`', async () => {
      render(<Button>My Button</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('should render a button using a render prop', () => {
      render(<Button>{(slot) => <>{JSON.stringify(slot)}</>}</Button>)

      expect(screen.getByRole('button').textContent).toEqual(
        JSON.stringify({
          disabled: false,
          hover: false,
          focus: false,
          active: false,
          autofocus: false,
        })
      )
    })

    it('should map the `autoFocus` prop to a `data-autofocus` attribute', () => {
      render(<Button autoFocus>My Button</Button>)

      expect(screen.getByRole('button')).toHaveAttribute('data-autofocus')
    })
  })
})
