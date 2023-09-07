import React, { useEffect, useState } from 'react'

export default function Page() {
  let [show, setShow] = useState(false)

  useEffect(() => {
    let timer = setInterval(() => {
      setShow((show) => !show)
    }, 2000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <List>
      <Item>Item A</Item>
      <div>
        <Item>Item B</Item>
      </div>
      {show && <Item>Item C</Item>}
      <Item>Item D</Item>
    </List>
  )
}

// ---

function List({ children }) {
  return (
    <ul>
      <Collection>{children}</Collection>
    </ul>
  )
}

function Item({ children }) {
  let idx = useCollectionIndex()

  return (
    <li>
      {children} — {idx}
    </li>
  )
}

// ---

function Collection({ children }) {
  console.log(children)
  return <>{children}</>
}

function useCollectionIndex() {
  console.log(React)
  return 0
}
