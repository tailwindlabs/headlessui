import React, { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { classNames } from '../../utils/class-names'

export default function Example() {
  let [value, setValue] = useState<string | undefined>(undefined)

  function cls({ disabled, active, selected }) {
    return classNames(
      active && 'bg-blue-400 text-white',
      selected && 'font-bold',
      disabled && 'opacity-75'
    )
  }

  return (
    <Combobox value={value} onChange={setValue}>
      <Combobox.Input />
      <Combobox.Button>Trigger</Combobox.Button>
      <Combobox.Options>
        <Combobox.Option value="alice" className={cls}>
          alice
        </Combobox.Option>
        <Combobox.Option value="bob" disabled className={cls}>
          bob
        </Combobox.Option>
        <Combobox.Option value="charlie" className={cls}>
          charlie
        </Combobox.Option>
      </Combobox.Options>
    </Combobox>
  )
}
