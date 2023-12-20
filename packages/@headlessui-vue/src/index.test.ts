import * as HeadlessUI from './index'

/**
 * Looks a bit of a silly test, however this ensures that we don't accidentally expose something to
 * the outside world that we didn't want!
 */
it('should expose the correct components', () => {
  expect(Object.keys(HeadlessUI).sort((a, z) => a.localeCompare(z))).toEqual([
    // Combobox
    'Combobox',
    'ComboboxButton',
    'ComboboxInput',
    'ComboboxLabel',
    'ComboboxOption',
    'ComboboxOptions',

    // Dialog
    'Dialog',
    'DialogBackdrop',
    'DialogDescription',
    'DialogOverlay',
    'DialogPanel',
    'DialogTitle',

    // Disclosure
    'Disclosure',
    'DisclosureButton',
    'DisclosurePanel',

    // FocusTrap
    'FocusTrap',

    // Listbox
    'Listbox',
    'ListboxButton',
    'ListboxLabel',
    'ListboxOption',
    'ListboxOptions',

    // Menu
    'Menu',
    'MenuButton',
    'MenuItem',
    'MenuItems',

    // Popover
    'Popover',
    'PopoverButton',
    'PopoverGroup',
    'PopoverOverlay',
    'PopoverPanel',

    // Portal
    'Portal',
    'PortalGroup',

    // RadioGroup
    'RadioGroup',
    'RadioGroupDescription',
    'RadioGroupLabel',
    'RadioGroupOption',

    // Switch
    'Switch',
    'SwitchDescription',
    'SwitchGroup',
    'SwitchLabel',

    // Tabs
    'Tab',
    'TabGroup',
    'TabList',
    'TabPanel',
    'TabPanels',

    // Transition
    'TransitionChild',
    'TransitionRoot',
  ])
})
