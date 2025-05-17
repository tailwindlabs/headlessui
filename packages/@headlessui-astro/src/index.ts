// Export Menu components
export { default as Menu } from './components/menu/Menu.astro';
export { default as MenuLoad } from './components/menu/Menu.load.astro';
export { default as MenuButton } from './components/menu/MenuButton.astro';
export { default as MenuItems } from './components/menu/MenuItems.astro';
export { default as MenuItem } from './components/menu/MenuItem.astro';

// Export Dialog components
export { default as Dialog } from './components/dialog/Dialog.astro';
export { default as DialogLoad } from './components/dialog/Dialog.load.astro';
export { default as DialogPanel } from './components/dialog/DialogPanel.astro';
export { default as DialogTitle } from './components/dialog/DialogTitle.astro';
export { default as DialogDescription } from './components/dialog/DialogDescription.astro';

// Re-export types from @headlessui/vue
export type { 
  // Menu types
  MenuProps, 
  MenuButtonProps, 
  MenuItemsProps, 
  MenuItemProps,
  
  // Dialog types
  DialogProps,
  DialogPanelProps,
  DialogTitleProps,
  DialogDescriptionProps
} from '@headlessui/vue';

// Export all other components following the same pattern...
// Will add more component exports as they're implemented