import { getTextarea } from '../../test-utils/accessibility-assertions'
import { focus, type, word } from '../../test-utils/interactions'
import {
  commonControlScenarios,
  commonFormScenarios,
  commonRenderingScenarios,
} from '../../test-utils/scenarios'
import { Textarea } from './textarea'

commonRenderingScenarios(Textarea, { getElement: getTextarea })
commonControlScenarios(Textarea)
commonFormScenarios(Textarea, {
  async performUserInteraction(control) {
    await focus(control)
    await type(word('alice'))
  },
})
