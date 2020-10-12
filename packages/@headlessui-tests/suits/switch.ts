import { createTestSuit } from '../create-test-suit'
import {
  assertActiveElement,
  assertSwitch,
  getSwitch,
  getSwitchLabel,
  SwitchState,
} from '../accessibility-assertions'
import { click, press, Keys } from '../interactions'

enum Scenarios {
  Default,
  WithOtherElement,
  WithGroup,
}

export const switchComponent = createTestSuit(Scenarios, ({ use }) => {
  describe('Keyboard interactions', () => {
    describe('`Space` key', () => {
      it('should be possible to toggle the Switch with Space', async () => {
        const handleChange = jest.fn()
        use(Scenarios.Default, { handleChange })

        // Ensure checkbox is off
        assertSwitch({ state: SwitchState.Off })

        // Focus the switch
        getSwitch()?.focus()

        // Toggle
        await press(Keys.Space)

        // Ensure state is on
        assertSwitch({ state: SwitchState.On })

        // Toggle
        await press(Keys.Space)

        // Ensure state is off
        assertSwitch({ state: SwitchState.Off })
      })
    })

    describe('`Enter` key', () => {
      it('should not be possible to use Enter to toggle the Switch', async () => {
        const handleChange = jest.fn()
        use(Scenarios.Default, { handleChange })

        // Ensure checkbox is off
        assertSwitch({ state: SwitchState.Off })

        // Focus the switch
        getSwitch()?.focus()

        // Try to toggle
        await press(Keys.Enter)

        expect(handleChange).not.toHaveBeenCalled()
      })
    })

    describe('`Tab` key', () => {
      it('should be possible to tab away from the Switch', async () => {
        use(Scenarios.WithOtherElement)

        // Ensure checkbox is off
        assertSwitch({ state: SwitchState.Off })

        // Focus the switch
        getSwitch()?.focus()

        // Expect the switch to be active
        assertActiveElement(getSwitch())

        // Toggle
        await press(Keys.Tab)

        // Expect the button to be active
        assertActiveElement(document.getElementById('btn'))
      })
    })
  })

  describe('Mouse interactions', () => {
    it('should be possible to toggle the Switch with a click', async () => {
      const handleChange = jest.fn()
      use(Scenarios.Default, { handleChange })

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Toggle
      await click(getSwitch())

      // Ensure state is on
      assertSwitch({ state: SwitchState.On })

      // Toggle
      await click(getSwitch())

      // Ensure state is off
      assertSwitch({ state: SwitchState.Off })
    })

    it('should be possible to toggle the Switch with a click on the Label', async () => {
      const handleChange = jest.fn()
      use(Scenarios.WithGroup, { handleChange })

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Toggle
      await click(getSwitchLabel())

      // Ensure the switch is focused
      assertActiveElement(getSwitch())

      // Ensure state is on
      assertSwitch({ state: SwitchState.On })

      // Toggle
      await click(getSwitchLabel())

      // Ensure the switch is focused
      assertActiveElement(getSwitch())

      // Ensure state is off
      assertSwitch({ state: SwitchState.Off })
    })
  })
})
