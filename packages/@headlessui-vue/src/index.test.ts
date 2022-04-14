import * as HeadlessUI from './index'

/**
 * Looks a bit of a silly test, however this ensures that we don't accidentally expose something to
 * the outside world that we didn't want!
 */
it('should expose the correct components', () => {
  expect(Object.keys(HeadlessUI)).toEqual([
    // Combobox
    'Combobox',
    'ComboboxLabel',
    'ComboboxButton',
    'ComboboxInput',
    'ComboboxOptions',
    'ComboboxOption',

    // Dialog
    'Dialog',
    'DialogOverlay',
    'DialogBackdrop',
    'DialogPanel',
    'DialogTitle',
    'DialogDescription',

    // Disclosure
    'Disclosure',
    'DisclosureButton',
    'DisclosurePanel',

    // FocusTrap
    'FocusTrap',

    // Listbox
    'Listbox',
    'ListboxLabel',
    'ListboxButton',
    'ListboxOptions',
    'ListboxOption',

    // Menu
    'Menu',
    'MenuButton',
    'MenuItems',
    'MenuItem',

    // Popover
    'Popover',
    'PopoverButton',
    'PopoverOverlay',
    'PopoverPanel',
    'PopoverGroup',

    // Portal
    'Portal',
    'PortalGroup',

    // RadioGroup
    'RadioGroup',
    'RadioGroupOption',
    'RadioGroupLabel',
    'RadioGroupDescription',

    // Switch
    'SwitchGroup',
    'Switch',
    'SwitchLabel',
    'SwitchDescription',

    // Tabs
    'TabGroup',
    'TabList',
    'Tab',
    'TabPanels',
    'TabPanel',

    // Transition
    'TransitionChild',
    'TransitionRoot',
  ])
})
