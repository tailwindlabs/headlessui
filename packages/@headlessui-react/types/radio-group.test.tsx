import React, { useState } from 'react'
import { Radio, RadioGroup } from '../src'

function ControlledNullableRadioGroup() {
  let [selected, setSelected] = useState<string | undefined>(undefined)

  return (
    <RadioGroup value={selected ?? null} onChange={setSelected}>
      <Radio value="startup">Startup</Radio>
      <Radio value="business">Business</Radio>
    </RadioGroup>
  )
}

void ControlledNullableRadioGroup
