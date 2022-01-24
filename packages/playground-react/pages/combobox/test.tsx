import React, { useState } from 'react'
import { Combobox } from '@headlessui/react'

export default function Example() {
  let [value, setValue] = useState<string | undefined>(undefined)

  return (
    <Combobox value={value} onChange={setValue}>
      <Combobox.Input />
      <Combobox.Button>Trigger</Combobox.Button>
      <Combobox.Options>
        <Combobox.Option value="alice">alice</Combobox.Option>
        <Combobox.Option value="bob">bob</Combobox.Option>
        <Combobox.Option value="charlie">charlie</Combobox.Option>
      </Combobox.Options>
    </Combobox>
  )
}
