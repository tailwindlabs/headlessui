import { createTestSuit } from '../create-test-suit'
import { suppressConsoleLogs } from '../utils/suppress-console-logs'
import {
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListbox,
  assertListboxOption,
  assertNoActiveListboxOption,
  assertNoSelectedListboxOption,
  getListbox,
  getListboxButton,
  getListboxButtons,
  getListboxes,
  getListboxLabel,
  getListboxOptions,
  ListboxState,
} from '../accessibility-assertions'
import {
  click,
  focus,
  mouseMove,
  mouseLeave,
  press,
  shift,
  type,
  word,
  Keys,
} from '../interactions'

enum Scenarios {
  Default,
  MultipleListboxes,
  WithState,
}

export const listbox = createTestSuit(Scenarios, ({ use }) => {
  describe('Keyboard interactions', () => {
    describe('`Enter` key', () => {
      it(
        'should be possible to open the listbox with Enter',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option, { selected: false }))

          // Verify that the first listbox option is active
          assertActiveListboxOption(options[0])
          assertNoSelectedListboxOption()
        })
      )

      it(
        'should not be possible to open the listbox with Enter when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { disabled: true, children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Try to open the listbox
          await press(Keys.Enter)

          // Verify it is still closed
          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })
        })
      )

      it(
        'should be possible to open the listbox with Enter, and focus the selected option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: 'b', onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

          // Verify that the second listbox option is active (because it is already selected)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should be possible to open the listbox with Enter, and focus the selected option (with a list of objects)',
        suppressConsoleLogs(async () => {
          const myOptions = [
            { id: 'a', name: 'Option A' },
            { id: 'b', name: 'Option B' },
            { id: 'c', name: 'Option C' },
          ]
          const selectedOption = myOptions[1]
          use(Scenarios.Default, {
            listbox: { value: selectedOption, onChange: console.log },
            button: { children: 'Trigger' },
            options: myOptions.map(option => ({ ...option, children: option.name, value: option })),
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

          // Verify that the second listbox option is active (because it is already selected)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should have no active listbox option when there are no listbox options at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [],
          })

          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())

          assertNoActiveListboxOption()
        })
      )

      it(
        'should focus the first non disabled listbox option when opening with Enter',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // Verify that the first non-disabled listbox option is active
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should focus the first non disabled listbox option when opening with Enter (jump over multiple disabled ones)',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // Verify that the first non-disabled listbox option is active
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should have no active listbox option upon Enter key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          assertNoActiveListboxOption()
        })
      )

      it(
        'should be possible to close the listbox with Enter when there is no active listboxoption',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Open listbox
          await click(getListboxButton())

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })

          // Close listbox
          await press(Keys.Enter)

          // Verify it is closed
          assertListboxButton({ state: ListboxState.Closed })
          assertListbox({ state: ListboxState.Closed })

          // Verify the button is focused again
          assertActiveElement(getListboxButton())
        })
      )

      it(
        'should be possible to close the listbox with Enter and choose the active listbox option',
        suppressConsoleLogs(async () => {
          const handleChange = jest.fn()
          use(Scenarios.WithState, {
            handleChange,
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Open listbox
          await click(getListboxButton())

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })

          // Activate the first listbox option
          const options = getListboxOptions()
          await mouseMove(options[0])

          // Choose option, and close listbox
          await press(Keys.Enter)

          // Verify it is closed
          assertListboxButton({ state: ListboxState.Closed })
          assertListbox({ state: ListboxState.Closed })

          // Verify we got the change event
          expect(handleChange).toHaveBeenCalledTimes(1)
          expect(handleChange).toHaveBeenCalledWith('a')

          // Verify the button is focused again
          assertActiveElement(getListboxButton())

          // Open listbox again
          await click(getListboxButton())

          // Verify the active option is the previously selected one
          assertActiveListboxOption(getListboxOptions()[0])
        })
      )
    })

    describe('`Space` key', () => {
      it(
        'should be possible to open the listbox with Space',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should not be possible to open the listbox with Space when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { disabled: true, children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Try to open the listbox
          await press(Keys.Space)

          // Verify it is still closed
          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })
        })
      )

      it(
        'should be possible to open the listbox with Space, and focus the selected option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: 'b', onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

          // Verify that the second listbox option is active (because it is already selected)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should have no active listbox option when there are no listbox options at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [],
          })

          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())

          assertNoActiveListboxOption()
        })
      )

      it(
        'should focus the first non disabled listbox option when opening with Space',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          const options = getListboxOptions()

          // Verify that the first non-disabled listbox option is active
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should focus the first non disabled listbox option when opening with Space (jump over multiple disabled ones)',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          const options = getListboxOptions()

          // Verify that the first non-disabled listbox option is active
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should have no active listbox option upon Space key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          assertNoActiveListboxOption()
        })
      )

      it(
        'should be possible to close the listbox with Space and choose the active listbox option',
        suppressConsoleLogs(async () => {
          const handleChange = jest.fn()
          use(Scenarios.WithState, {
            handleChange,
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Open listbox
          await click(getListboxButton())

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })

          // Activate the first listbox option
          const options = getListboxOptions()
          await mouseMove(options[0])

          // Choose option, and close listbox
          await press(Keys.Space)

          // Verify it is closed
          assertListboxButton({ state: ListboxState.Closed })
          assertListbox({ state: ListboxState.Closed })

          // Verify we got the change event
          expect(handleChange).toHaveBeenCalledTimes(1)
          expect(handleChange).toHaveBeenCalledWith('a')

          // Verify the button is focused again
          assertActiveElement(getListboxButton())

          // Open listbox again
          await click(getListboxButton())

          // Verify the active option is the previously selected one
          assertActiveListboxOption(getListboxOptions()[0])
        })
      )
    })

    describe('`Escape` key', () => {
      it(
        'should be possible to close an open listbox with Escape',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Space)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Close listbox
          await press(Keys.Escape)

          // Verify it is closed
          assertListboxButton({ state: ListboxState.Closed })
          assertListbox({ state: ListboxState.Closed })

          // Verify the button is focused again
          assertActiveElement(getListboxButton())
        })
      )
    })

    describe('`Tab` key', () => {
      it(
        'should focus trap when we use Tab',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[0])

          // Try to tab
          await press(Keys.Tab)

          // Verify it is still open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())
        })
      )

      it(
        'should focus trap when we use Shift+Tab',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[0])

          // Try to Shift+Tab
          await press(shift(Keys.Tab))

          // Verify it is still open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())
        })
      )
    })

    describe('`ArrowDown` key', () => {
      it(
        'should be possible to open the listbox with ArrowDown',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowDown)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))

          // Verify that the first listbox option is active
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should not be possible to open the listbox with ArrowDown when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { disabled: true, children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Try to open the listbox
          await press(Keys.ArrowDown)

          // Verify it is still closed
          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })
        })
      )

      it(
        'should be possible to open the listbox with ArrowDown, and focus the selected option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: 'b', onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowDown)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

          // Verify that the second listbox option is active (because it is already selected)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should have no active listbox option when there are no listbox options at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [],
          })

          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowDown)
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())

          assertNoActiveListboxOption()
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[0])

          // We should be able to go down once
          await press(Keys.ArrowDown)
          assertActiveListboxOption(options[1])

          // We should be able to go down again
          await press(Keys.ArrowDown)
          assertActiveListboxOption(options[2])

          // We should NOT be able to go down again (because last option). Current implementation won't go around.
          await press(Keys.ArrowDown)
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the listbox options and skip the first disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[1])

          // We should be able to go down once
          await press(Keys.ArrowDown)
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the listbox options and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[2])
        })
      )
    })

    describe('`ArrowUp` key', () => {
      it(
        'should be possible to open the listbox with ArrowUp and the last option should be active',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))

          // ! ALERT: The LAST option should now be active
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should not be possible to open the listbox with ArrowUp and the last option should be active when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { disabled: true, children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Try to open the listbox
          await press(Keys.ArrowUp)

          // Verify it is still closed
          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })
        })
      )

      it(
        'should be possible to open the listbox with ArrowUp, and focus the selected option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: 'b', onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

          // Verify that the second listbox option is active (because it is already selected)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should have no active listbox option when there are no listbox options at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [],
          })

          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)
          assertListbox({ state: ListboxState.Open })
          assertActiveElement(getListbox())

          assertNoActiveListboxOption()
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the listbox options and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should not be possible to navigate up or down if there is only a single non-disabled option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[2])

          // We should not be able to go up (because those are disabled)
          await press(Keys.ArrowUp)
          assertActiveListboxOption(options[2])

          // We should not be able to go down (because this is the last option)
          await press(Keys.ArrowDown)
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          assertListboxButton({
            state: ListboxState.Closed,
            attributes: { id: 'headlessui-listbox-button-1' },
          })
          assertListbox({ state: ListboxState.Closed })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          // Verify it is open
          assertListboxButton({ state: ListboxState.Open })
          assertListbox({
            state: ListboxState.Open,
            attributes: { id: 'headlessui-listbox-options-2' },
          })
          assertActiveElement(getListbox())
          assertListboxButtonLinkedWithListbox()

          // Verify we have listbox options
          const options = getListboxOptions()
          expect(options).toHaveLength(3)
          options.forEach(option => assertListboxOption(option))
          assertActiveListboxOption(options[2])

          // We should be able to go down once
          await press(Keys.ArrowUp)
          assertActiveListboxOption(options[1])

          // We should be able to go down again
          await press(Keys.ArrowUp)
          assertActiveListboxOption(options[0])

          // We should NOT be able to go up again (because first option). Current implementation won't go around.
          await press(Keys.ArrowUp)
          assertActiveListboxOption(options[0])
        })
      )
    })

    describe('`End` key', () => {
      it(
        'should be possible to use the End key to go to the last listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // We should be on the first option
          assertActiveListboxOption(options[0])

          // We should be able to go to the last option
          await press(Keys.End)
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use the End key to go to the last non disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // We should be on the first option
          assertActiveListboxOption(options[0])

          // We should be able to go to the last non-disabled option
          await press(Keys.End)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should be possible to use the End key to go to the first listbox option if that is the only non-disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.End)

          const options = getListboxOptions()
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should have no active listbox option upon End key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.End)

          assertNoActiveListboxOption()
        })
      )
    })

    describe('`PageDown` key', () => {
      it(
        'should be possible to use the PageDown key to go to the last listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // We should be on the first option
          assertActiveListboxOption(options[0])

          // We should be able to go to the last option
          await press(Keys.PageDown)
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use the PageDown key to go to the last non disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.Enter)

          const options = getListboxOptions()

          // We should be on the first option
          assertActiveListboxOption(options[0])

          // We should be able to go to the last non-disabled option
          await press(Keys.PageDown)
          assertActiveListboxOption(options[1])
        })
      )

      it(
        'should be possible to use the PageDown key to go to the first listbox option if that is the only non-disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.PageDown)

          const options = getListboxOptions()
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should have no active listbox option upon PageDown key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.PageDown)

          assertNoActiveListboxOption()
        })
      )
    })

    describe('`Home` key', () => {
      it(
        'should be possible to use the Home key to go to the first listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          const options = getListboxOptions()

          // We should be on the last option
          assertActiveListboxOption(options[2])

          // We should be able to go to the first option
          await press(Keys.Home)
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should be possible to use the Home key to go to the first non disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
              { value: 'd', children: 'Option D' },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.Home)

          const options = getListboxOptions()

          // We should be on the first non-disabled option
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use the Home key to go to the last listbox option if that is the only non-disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D' },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.Home)

          const options = getListboxOptions()
          assertActiveListboxOption(options[3])
        })
      )

      it(
        'should have no active listbox option upon Home key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.Home)

          assertNoActiveListboxOption()
        })
      )
    })

    describe('`PageUp` key', () => {
      it(
        'should be possible to use the PageUp key to go to the first listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A' },
              { value: 'b', children: 'Option B' },
              { value: 'c', children: 'Option C' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          const options = getListboxOptions()

          // We should be on the last option
          assertActiveListboxOption(options[2])

          // We should be able to go to the first option
          await press(Keys.PageUp)
          assertActiveListboxOption(options[0])
        })
      )

      it(
        'should be possible to use the PageUp key to go to the first non disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C' },
              { value: 'd', children: 'Option D' },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          const options = getListboxOptions()

          // We should be on the first non-disabled option
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to use the PageUp key to go to the last listbox option if that is the only non-disabled listbox option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D' },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          const options = getListboxOptions()
          assertActiveListboxOption(options[3])
        })
      )

      it(
        'should have no active listbox option upon PageUp key press, when there are no non-disabled listbox options',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'Option A', disabled: true },
              { value: 'b', children: 'Option B', disabled: true },
              { value: 'c', children: 'Option C', disabled: true },
              { value: 'd', children: 'Option D', disabled: true },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          // We opened via click, we don't have an active option
          assertNoActiveListboxOption()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          assertNoActiveListboxOption()
        })
      )
    })

    describe('`Any` key aka search', () => {
      it(
        'should be possible to type a full word that has a perfect match',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'alice', children: 'alice' },
              { value: 'bob', children: 'bob' },
              { value: 'charlie', children: 'charlie' },
            ],
          })

          // Open listbox
          await click(getListboxButton())

          const options = getListboxOptions()

          // We should be able to go to the second option
          await type(word('bob'))
          assertActiveListboxOption(options[1])

          // We should be able to go to the first option
          await type(word('alice'))
          assertActiveListboxOption(options[0])

          // We should be able to go to the last option
          await type(word('charlie'))
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to type a partial of a word',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'alice', children: 'alice' },
              { value: 'bob', children: 'bob' },
              { value: 'charlie', children: 'charlie' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          const options = getListboxOptions()

          // We should be on the last option
          assertActiveListboxOption(options[2])

          // We should be able to go to the second option
          await type(word('bo'))
          assertActiveListboxOption(options[1])

          // We should be able to go to the first option
          await type(word('ali'))
          assertActiveListboxOption(options[0])

          // We should be able to go to the last option
          await type(word('char'))
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should be possible to type words with spaces',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'a', children: 'value a' },
              { value: 'b', children: 'value b' },
              { value: 'c', children: 'value c' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          const options = getListboxOptions()

          // We should be on the last option
          assertActiveListboxOption(options[2])

          // We should be able to go to the second option
          await type(word('value b'))
          assertActiveListboxOption(options[1])

          // We should be able to go to the first option
          await type(word('value a'))
          assertActiveListboxOption(options[0])

          // We should be able to go to the last option
          await type(word('value c'))
          assertActiveListboxOption(options[2])
        })
      )

      it(
        'should not be possible to search for a disabled option',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'alice', children: 'alice' },
              { value: 'bob', children: 'bob', disabled: true },
              { value: 'charlie', children: 'charlie' },
            ],
          })

          // Focus the button
          getListboxButton()?.focus()

          // Open listbox
          await press(Keys.ArrowUp)

          const options = getListboxOptions()

          // We should be on the last option
          assertActiveListboxOption(options[2])

          // We should not be able to go to the disabled option
          await type(word('bo'))

          // We should still be on the last option
          assertActiveListboxOption(options[2])
        })
      )
    })
  })

  describe('Mouse interactions', () => {
    it(
      'should focus the Listbox.Button when we click the Listbox.Label',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          label: { children: 'Label' },
          button: { children: 'Trigger' },
          options: [
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
            { value: 'c', children: 'Option C' },
          ],
        })

        // Ensure the button is not focused yet
        assertActiveElement(document.body)

        // Focus the label
        await click(getListboxLabel())

        // Ensure that the actual button is focused instead
        assertActiveElement(getListboxButton())
      })
    )

    it(
      'should be possible to open the listbox on click',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
            { value: 'c', children: 'Option C' },
          ],
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach(option => assertListboxOption(option))
      })
    )

    it(
      'should not be possible to open the listbox on click when the button is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { disabled: true, children: 'Trigger' },
          options: [
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
            { value: 'c', children: 'Option C' },
          ],
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Try to open the listbox
        await click(getListboxButton())

        // Verify it is still closed
        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })
      })
    )

    it(
      'should be possible to open the listbox on click, and focus the selected option',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: 'b', onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
            { value: 'c', children: 'Option C' },
          ],
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })
        assertListbox({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-options-2' },
        })
        assertActiveElement(getListbox())
        assertListboxButtonLinkedWithListbox()

        // Verify we have listbox options
        const options = getListboxOptions()
        expect(options).toHaveLength(3)
        options.forEach((option, i) => assertListboxOption(option, { selected: i === 1 }))

        // Verify that the second listbox option is active (because it is already selected)
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be possible to close a listbox on click',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
            { value: 'c', children: 'Option C' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        // Verify it is open
        assertListboxButton({ state: ListboxState.Open })

        // Click to close
        await click(getListboxButton())

        // Verify it is closed
        assertListboxButton({ state: ListboxState.Closed })
        assertListbox({ state: ListboxState.Closed })
      })
    )

    it('should focus the listbox when you try to focus the button again (when the listbox is already open)', async () => {
      use(Scenarios.Default, {
        listbox: { value: undefined, onChange: console.log },
        button: { children: 'Trigger' },
        options: [
          { value: 'a', children: 'Option A' },
          { value: 'b', children: 'Option B' },
          { value: 'c', children: 'Option C' },
        ],
      })

      // Open listbox
      await click(getListboxButton())

      // Verify listbox is focused
      assertActiveElement(getListbox())

      // Try to Re-focus the button
      getListboxButton()?.focus()

      // Verify listbox is still focused
      assertActiveElement(getListbox())
    })

    it(
      'should be a no-op when we click outside of a closed listbox',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Verify that the window is closed
        assertListbox({ state: ListboxState.Closed })

        // Click something that is not related to the listbox
        await click(document.body)

        // Should still be closed
        assertListbox({ state: ListboxState.Closed })
      })
    )

    it(
      'should be possible to click outside of the listbox which should close the listbox',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        // Click something that is not related to the listbox
        await click(document.body)

        // Should be closed now
        assertListbox({ state: ListboxState.Closed })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )

    it(
      'should be possible to click outside of the listbox on another listbox button which should close the current listbox and open the new listbox',
      suppressConsoleLogs(async () => {
        use(Scenarios.MultipleListboxes, [
          // Listbox 1
          {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'alice', children: 'alice' },
              { value: 'bob', children: 'bob', disabled: true },
              { value: 'charlie', children: 'charlie' },
            ],
          },

          // Listbox 2
          {
            listbox: { value: undefined, onChange: console.log },
            button: { children: 'Trigger' },
            options: [
              { value: 'alice', children: 'alice' },
              { value: 'bob', children: 'bob', disabled: true },
              { value: 'charlie', children: 'charlie' },
            ],
          },
        ])

        const [button1, button2] = getListboxButtons()

        // Click the first menu button
        await click(button1)
        expect(getListboxes()).toHaveLength(1) // Only 1 menu should be visible

        // Ensure the open menu is linked to the first button
        assertListboxButtonLinkedWithListbox(button1, getListbox())

        // Click the second menu button
        await click(button2)

        expect(getListboxes()).toHaveLength(1) // Only 1 menu should be visible

        // Ensure the open menu is linked to the second button
        assertListboxButtonLinkedWithListbox(button2, getListbox())
      })
    )

    it(
      'should be possible to click outside of the listbox which should close the listbox (even if we press the listbox button)',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        // Click the listbox button again
        await click(getListboxButton())

        // Should be closed now
        assertListbox({ state: ListboxState.Closed })

        // Verify the button is focused again
        assertActiveElement(getListboxButton())
      })
    )

    it(
      'should be possible to hover an option and make it active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()
        // We should be able to go to the second option
        await mouseMove(options[1])
        assertActiveListboxOption(options[1])

        // We should be able to go to the first option
        await mouseMove(options[0])
        assertActiveListboxOption(options[0])

        // We should be able to go to the last option
        await mouseMove(options[2])
        assertActiveListboxOption(options[2])
      })
    )

    it(
      'should make a listbox option active when you move the mouse over it',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()
        // We should be able to go to the second option
        await mouseMove(options[1])
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be a no-op when we move the mouse and the listbox option is already active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        // We should be able to go to the second option
        await mouseMove(options[1])
        assertActiveListboxOption(options[1])

        await mouseMove(options[1])

        // Nothing should be changed
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should be a no-op when we move the mouse and the listbox option is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        await mouseMove(options[1])
        assertNoActiveListboxOption()
      })
    )

    it(
      'should not be possible to hover an option that is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        // Try to hover over option 1, which is disabled
        await mouseMove(options[1])

        // We should not have an active option now
        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to mouse leave an option and make it inactive',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        // We should be able to go to the second option
        await mouseMove(options[1])
        assertActiveListboxOption(options[1])

        await mouseLeave(options[1])
        assertNoActiveListboxOption()

        // We should be able to go to the first option
        await mouseMove(options[0])
        assertActiveListboxOption(options[0])

        await mouseLeave(options[0])
        assertNoActiveListboxOption()

        // We should be able to go to the last option
        await mouseMove(options[2])
        assertActiveListboxOption(options[2])

        await mouseLeave(options[2])
        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to mouse leave a disabled option and be a no-op',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())

        const options = getListboxOptions()

        // Try to hover over option 1, which is disabled
        await mouseMove(options[1])
        assertNoActiveListboxOption()

        await mouseLeave(options[1])
        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible to click a listbox option, which closes the listbox',
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn()
        use(Scenarios.WithState, {
          handleChange,
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        const options = getListboxOptions()

        // We should be able to click the first option
        await click(options[1])
        assertListbox({ state: ListboxState.Closed })
        expect(handleChange).toHaveBeenCalledTimes(1)
        expect(handleChange).toHaveBeenCalledWith('bob')

        // Verify the button is focused again
        assertActiveElement(getListboxButton())

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is the previously selected one
        assertActiveListboxOption(getListboxOptions()[1])
      })
    )

    it(
      'should be possible to click a disabled listbox option, which is a no-op',
      suppressConsoleLogs(async () => {
        const handleChange = jest.fn()
        use(Scenarios.WithState, {
          handleChange,
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        const options = getListboxOptions()

        // We should be able to click the first option
        await click(options[1])
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())
        expect(handleChange).toHaveBeenCalledTimes(0)

        // Close the listbox
        await click(getListboxButton())

        // Open listbox again
        await click(getListboxButton())

        // Verify the active option is non existing
        assertNoActiveListboxOption()
      })
    )

    it(
      'should be possible focus a listbox option, so that it becomes active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob' },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        const options = getListboxOptions()

        // Verify that nothing is active yet
        assertNoActiveListboxOption()

        // We should be able to focus the first option
        await focus(options[1])
        assertActiveListboxOption(options[1])
      })
    )

    it(
      'should not be possible to focus a listbox option which is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          listbox: { value: undefined, onChange: console.log },
          button: { children: 'Trigger' },
          options: [
            { value: 'alice', children: 'alice' },
            { value: 'bob', children: 'bob', disabled: true },
            { value: 'charlie', children: 'charlie' },
          ],
        })

        // Open listbox
        await click(getListboxButton())
        assertListbox({ state: ListboxState.Open })
        assertActiveElement(getListbox())

        const options = getListboxOptions()

        // We should not be able to focus the first option
        await focus(options[1])
        assertNoActiveListboxOption()
      })
    )
  })
})
