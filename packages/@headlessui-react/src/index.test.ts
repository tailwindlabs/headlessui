import * as HeadlessUI from './index'

/**
 * Looks a bit of a silly test, however this ensures that we don't accidentally expose something to
 * the outside world that we didn't want!
 */
it('should expose the correct components', () => {
  expect(Object.keys(HeadlessUI).sort((a, z) => a.localeCompare(z))).toEqual([
    'Button',

    'Checkbox',

    'Combobox',
    'ComboboxButton',
    'ComboboxInput',
    'ComboboxLabel',
    'ComboboxOption',
    'ComboboxOptions',

    'DataInteractive',

    'Description',

    'Dialog',
    'DialogBackdrop',
    'DialogDescription',
    'DialogOverlay',
    'DialogPanel',
    'DialogTitle',

    'Disclosure',
    'DisclosureButton',
    'DisclosurePanel',

    'Field',
    'Fieldset',

    'FocusTrap',
    'FocusTrapFeatures',

    'Input',

    'Label',

    'Legend',

    'Listbox',
    'ListboxButton',
    'ListboxLabel',
    'ListboxOption',
    'ListboxOptions',
    'ListboxSelectedOption',

    'Menu',
    'MenuButton',
    'MenuHeading',
    'MenuItem',
    'MenuItems',
    'MenuSection',
    'MenuSeparator',

    'Popover',
    'PopoverButton',
    'PopoverGroup',
    'PopoverOverlay',
    'PopoverPanel',

    'Portal',

    'Radio',
    'RadioGroup',
    'RadioGroupDescription',
    'RadioGroupLabel',
    'RadioGroupOption',

    'Select',

    'Switch',
    'SwitchDescription',
    'SwitchGroup',
    'SwitchLabel',

    'Tab',
    'TabGroup',
    'TabList',
    'TabPanel',
    'TabPanels',

    'Textarea',

    'Transition',
    'TransitionChild',
  ])
})
