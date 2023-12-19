import { render, screen } from '@testing-library/react'
import React from 'react'
import { focus, mouseEnter } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { DataInteractive } from './data-interactive'

it(
  'should expose focus data attributes on the element',
  suppressConsoleLogs(async () => {
    render(
      <DataInteractive>
        <a href="alice">Alice</a>
      </DataInteractive>
    )

    let a = screen.getByText('Alice')

    // Should not have the data attribute
    expect(a).not.toHaveAttribute('data-focus')

    // Focus on the element
    await focus(a)

    // Should be focused
    expect(a).toHaveFocus()

    // Should have the data attribute
    expect(a).toHaveAttribute('data-focus')
  })
)

it(
  'should expose hover data attributes on the element',
  suppressConsoleLogs(async () => {
    render(
      <DataInteractive>
        <a href="alice">Alice</a>
      </DataInteractive>
    )

    let a = screen.getByText('Alice')

    // Should not have the data attribute
    expect(a).not.toHaveAttribute('data-hover')

    // Hover on the element
    await mouseEnter(a)

    // Should have the data attribute
    expect(a).toHaveAttribute('data-hover')
  })
)
