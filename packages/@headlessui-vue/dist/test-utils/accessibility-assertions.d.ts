export declare function getMenuButton(): HTMLElement | null;
export declare function getMenuButtons(): HTMLElement[];
export declare function getMenu(): HTMLElement | null;
export declare function getMenus(): HTMLElement[];
export declare function getMenuItems(): HTMLElement[];
export declare enum MenuState {
    /** The menu is visible to the user. */
    Visible = 0,
    /** The menu is **not** visible to the user. It's still in the DOM, but it is hidden. */
    InvisibleHidden = 1,
    /** The menu is **not** visible to the user. It's not in the DOM, it is unmounted. */
    InvisibleUnmounted = 2
}
export declare function assertMenuButton(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: MenuState;
}, button?: HTMLElement | null): void;
export declare function assertMenuButtonLinkedWithMenu(button?: HTMLElement | null, menu?: HTMLElement | null): void;
export declare function assertMenuLinkedWithMenuItem(item: HTMLElement | null, menu?: HTMLElement | null): void;
export declare function assertNoActiveMenuItem(menu?: HTMLElement | null): void;
export declare function assertMenu(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: MenuState;
}, menu?: HTMLElement | null): void;
export declare function assertMenuItem(item: HTMLElement | null, options?: {
    tag?: string;
    attributes?: Record<string, string | null>;
}): void;
export declare function getListboxLabel(): HTMLElement | null;
export declare function getListboxButton(): HTMLElement | null;
export declare function getListboxButtons(): HTMLElement[];
export declare function getListbox(): HTMLElement | null;
export declare function getListboxes(): HTMLElement[];
export declare function getListboxOptions(): HTMLElement[];
export declare enum ListboxState {
    /** The listbox is visible to the user. */
    Visible = 0,
    /** The listbox is **not** visible to the user. It's still in the DOM, but it is hidden. */
    InvisibleHidden = 1,
    /** The listbox is **not** visible to the user. It's not in the DOM, it is unmounted. */
    InvisibleUnmounted = 2
}
export declare function assertListbox(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: ListboxState;
    orientation?: 'horizontal' | 'vertical';
}, listbox?: HTMLElement | null): void;
export declare function assertListboxButton(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: ListboxState;
}, button?: HTMLElement | null): void;
export declare function assertListboxLabel(options: {
    attributes?: Record<string, string | null>;
    tag?: string;
    textContent?: string;
}, label?: HTMLElement | null): void;
export declare function assertListboxButtonLinkedWithListbox(button?: HTMLElement | null, listbox?: HTMLElement | null): void;
export declare function assertListboxLabelLinkedWithListbox(label?: HTMLElement | null, listbox?: HTMLElement | null): void;
export declare function assertListboxButtonLinkedWithListboxLabel(button?: HTMLElement | null, label?: HTMLElement | null): void;
export declare function assertActiveListboxOption(item: HTMLElement | null, listbox?: HTMLElement | null): void;
export declare function assertNoActiveListboxOption(listbox?: HTMLElement | null): void;
export declare function assertNoSelectedListboxOption(items?: HTMLElement[]): void;
export declare function assertListboxOption(item: HTMLElement | null, options?: {
    tag?: string;
    attributes?: Record<string, string | null>;
    selected?: boolean;
}): void;
export declare function getSwitch(): HTMLElement | null;
export declare function getSwitchLabel(): HTMLElement | null;
export declare enum SwitchState {
    On = 0,
    Off = 1
}
export declare function assertSwitch(options: {
    state: SwitchState;
    tag?: string;
    textContent?: string;
    label?: string;
    description?: string;
}, switchElement?: HTMLElement | null): void;
export declare function getDisclosureButton(): HTMLElement | null;
export declare function getDisclosurePanel(): HTMLElement | null;
export declare enum DisclosureState {
    /** The disclosure is visible to the user. */
    Visible = 0,
    /** The disclosure is **not** visible to the user. It's still in the DOM, but it is hidden. */
    InvisibleHidden = 1,
    /** The disclosure is **not** visible to the user. It's not in the DOM, it is unmounted. */
    InvisibleUnmounted = 2
}
export declare function assertDisclosureButton(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DisclosureState;
}, button?: HTMLElement | null): void;
export declare function assertDisclosurePanel(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DisclosureState;
}, panel?: HTMLElement | null): void;
export declare function getPopoverButton(): HTMLElement | null;
export declare function getPopoverPanel(): HTMLElement | null;
export declare function getPopoverOverlay(): HTMLElement | null;
export declare enum PopoverState {
    /** The popover is visible to the user. */
    Visible = 0,
    /** The popover is **not** visible to the user. It's still in the DOM, but it is hidden. */
    InvisibleHidden = 1,
    /** The popover is **not** visible to the user. It's not in the DOM, it is unmounted. */
    InvisibleUnmounted = 2
}
export declare function assertPopoverButton(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: PopoverState;
}, button?: HTMLElement | null): void;
export declare function assertPopoverPanel(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: PopoverState;
}, panel?: HTMLElement | null): void;
export declare function assertLabelValue(element: HTMLElement | null, value: string): void;
export declare function assertDescriptionValue(element: HTMLElement | null, value: string): void;
export declare function getDialog(): HTMLElement | null;
export declare function getDialogs(): HTMLElement[];
export declare function getDialogTitle(): HTMLElement | null;
export declare function getDialogDescription(): HTMLElement | null;
export declare function getDialogOverlay(): HTMLElement | null;
export declare function getDialogOverlays(): HTMLElement[];
export declare enum DialogState {
    /** The dialog is visible to the user. */
    Visible = 0,
    /** The dialog is **not** visible to the user. It's still in the DOM, but it is hidden. */
    InvisibleHidden = 1,
    /** The dialog is **not** visible to the user. It's not in the DOM, it is unmounted. */
    InvisibleUnmounted = 2
}
export declare function assertDialog(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DialogState;
}, dialog?: HTMLElement | null): void;
export declare function assertDialogTitle(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DialogState;
}, title?: HTMLElement | null, dialog?: HTMLElement | null): void;
export declare function assertDialogDescription(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DialogState;
}, description?: HTMLElement | null, dialog?: HTMLElement | null): void;
export declare function assertDialogOverlay(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
    state: DialogState;
}, overlay?: HTMLElement | null): void;
export declare function getRadioGroup(): HTMLElement | null;
export declare function getRadioGroupLabel(): HTMLElement | null;
export declare function getRadioGroupOptions(): HTMLElement[];
export declare function assertRadioGroupLabel(options: {
    attributes?: Record<string, string | null>;
    textContent?: string;
}, label?: HTMLElement | null, radioGroup?: HTMLElement | null): void;
export declare function getTabList(): HTMLElement | null;
export declare function getTabs(): HTMLElement[];
export declare function getPanels(): HTMLElement[];
export declare function assertTabs({ active, orientation, }: {
    active: number;
    orientation?: 'vertical' | 'horizontal';
}, list?: HTMLElement | null, tabs?: HTMLElement[], panels?: HTMLElement[]): void;
export declare function assertActiveElement(element: HTMLElement | null): void;
export declare function assertContainsActiveElement(element: HTMLElement | null): void;
export declare function assertHidden(element: HTMLElement | null): void;
export declare function assertVisible(element: HTMLElement | null): void;
export declare function assertFocusable(element: HTMLElement | null): void;
export declare function assertNotFocusable(element: HTMLElement | null): void;
export declare function getByText(text: string): HTMLElement | null;
