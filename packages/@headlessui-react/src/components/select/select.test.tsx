import React from 'react'
import { getSelect } from '../../test-utils/accessibility-assertions'
import {
  commonControlScenarios,
  commonFormScenarios,
  commonRenderingScenarios,
} from '../../test-utils/scenarios'
import { Select } from './select'

commonRenderingScenarios(Select, { getElement: getSelect })
commonControlScenarios(Select)
commonFormScenarios(
  (props) => (
    <Select defaultValue="bob" {...props}>
      <option value="alice">Alice</option>
      <option value="bob">Bob</option>
      <option value="charlie">Charlie</option>
    </Select>
  ),
  {
    async performUserInteraction(control) {
      if (control instanceof HTMLSelectElement) {
        control.value = 'alice'
      }
    },
  }
)
