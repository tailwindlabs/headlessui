# Combobox Component Implementation Plan

The Combobox component is a more advanced selection component that combines text input with dropdown selection functionality. It's commonly used for autocomplete, search with suggestions, and filtering large datasets.

## Component Structure

1. **Core Components**
   - `Combobox.astro` - Main wrapper component
   - `ComboboxInput.astro` - Text input field for filtering
   - `ComboboxButton.astro` - Button to toggle the options dropdown
   - `ComboboxOptions.astro` - Container for the dropdown options
   - `ComboboxOption.astro` - Individual option in the dropdown
   - `ComboboxLabel.astro` - Accessibility label for the combobox

2. **Hydration Variants**
   - `Combobox.load.astro` - Eager loading variant

## Implementation Approach

### 1. Core Functionality (client-side)

Create a `combobox-client.ts` file that will handle:

- State management for open/closed state
- Filtering logic based on input text
- Keyboard navigation (arrows, enter, escape)
- Type-ahead functionality
- Selection management (single or multiple)
- Accessiblity attributes (ARIA)

```typescript
// Example structure for combobox-client.ts

interface ComboboxState {
  open: boolean;
  inputValue: string;
  selectedValue: any;
  activeIndex: number;
  filteredOptions: Option[];
  options: Option[];
  multiple: boolean;
}

export function createComboboxContext(element: HTMLElement) {
  // Create state management
  const state = createState<ComboboxState>({
    open: false,
    inputValue: '',
    selectedValue: undefined,
    activeIndex: -1,
    filteredOptions: [],
    options: [],
    multiple: false,
  });

  // Functions for managing state and interactions
  const openCombobox = () => { /* ... */ };
  const closeCombobox = () => { /* ... */ };
  const filterOptions = (value: string) => { /* ... */ };
  const selectOption = (index: number) => { /* ... */ };
  const handleInputChange = (event: Event) => { /* ... */ };
  const setupKeyboardHandler = () => { /* ... */ };

  // Initialize
  const init = () => { /* ... */ };

  // Return public API
  return {
    openCombobox,
    closeCombobox,
    filterOptions,
    selectOption,
    getSelectedValue: () => state.getState().selectedValue,
    getInputValue: () => state.getState().inputValue,
    isOpen: () => state.getState().open,
  };
}
```

### 2. Type Definitions

Create `combobox.ts` in the types directory:

```typescript
// Types for Combobox components

export interface ComboboxProps {
  as?: string;
  value?: any;
  onChange?: (value: any) => void;
  multiple?: boolean;
  disabled?: boolean;
  client?: HydrationDirective;
  id?: string;
  // Additional filtering properties
  by?: string | ((item: any, query: string) => boolean);
  [key: string]: any;
}

export interface ComboboxInputProps {
  as?: string;
  id?: string;
  displayValue?: (item: any) => string;
  onChange?: (event: Event) => void;
  placeholder?: string;
  disabled?: boolean;
  [key: string]: any;
}

// Add types for Button, Options, Option, Label...
```

### 3. Component Implementation

#### Combobox.astro
- Set up basic structure and props
- Include client-side script for hydration
- Pass necessary data attributes for state management

#### ComboboxInput.astro
- Handle filtering as user types
- Support custom display value formatting
- Ensure proper ARIA attributes (e.g., `aria-controls`, `aria-expanded`)

#### ComboboxOptions.astro
- Support static rendering or dynamic filtering
- Handle positioning (similar to Listbox)
- Support virtualization for large datasets (optional)

#### ComboboxOption.astro
- Display option content
- Support state indicators (active, selected)
- Handle keyboard focus

### 4. Accessibility Features

Ensure the Combobox follows the [ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/):

- Proper role attributes (`role="combobox"`, `role="listbox"`, etc.)
- ARIA state attributes (`aria-expanded`, `aria-activedescendant`, `aria-selected`)
- Keyboard navigation
  - Arrow up/down: Navigate options
  - Enter: Select option
  - Escape: Close dropdown
  - Type-ahead: Jump to matching options

### 5. Advanced Features

- **Filtering Customization**: Allow custom filtering logic
- **Multiple Selection**: Support selecting multiple items (`multiple` prop)
- **Custom Rendering**: Support render props/slots for custom option rendering
- **Empty States**: Support custom empty state when no options match filter
- **Virtualization**: Support efficient rendering of large option lists

## Implementation Steps

1. Create type definitions in `/src/types/combobox.ts`
2. Implement client-side functionality in `/src/components/combobox/combobox-client.ts`
3. Create base component files:
   - `/src/components/combobox/Combobox.astro`
   - `/src/components/combobox/ComboboxInput.astro`
   - `/src/components/combobox/ComboboxButton.astro`
   - `/src/components/combobox/ComboboxOptions.astro`
   - `/src/components/combobox/ComboboxOption.astro`
   - `/src/components/combobox/ComboboxLabel.astro`
4. Create hydration variant: `/src/components/combobox/Combobox.load.astro`
5. Update exports in the main `index.ts` file
6. Update documentation and examples
7. Create playground examples

## Testing Considerations

- Test with both static and dynamic options
- Test with different filtering strategies
- Verify keyboard navigation
- Test with different hydration strategies
- Test accessibility with screen readers

## Documentation Needs

- Basic usage examples
- Filtering customization
- Multiple selection
- Custom rendering
- Type-ahead functionality
- Keyboard shortcuts