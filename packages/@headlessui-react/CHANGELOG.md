# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Nothing yet!

## [2.0.0-alpha.3] - 2023-12-20

### Fixed

- Further fine tune scroll locking on iOS ([#2891](https://github.com/tailwindlabs/headlessui/pull/2891))

## [2.0.0-alpha.2] - 2023-12-20

### Fixed

- Allow horizontal scrolling inside the `Dialog` component ([#2889](https://github.com/tailwindlabs/headlessui/pull/2889))
- Improve cancellation of events when using `disabled` or `aria-disabled` attributes ([#2890](https://github.com/tailwindlabs/headlessui/pull/2890))

## [2.0.0-alpha.1] - 2023-12-20

### Added

- Add `immediate` prop to `<Combobox />` for immediately opening the Combobox when the `input` receives focus ([#2686](https://github.com/tailwindlabs/headlessui/pull/2686))
- Add `virtual` prop to `Combobox` component ([#2779](https://github.com/tailwindlabs/headlessui/pull/2779))
- Add new `Checkbox` component
- Add new `Radio` component as an alternative to the existing `RadioGroup.Option` component
- Add new `Button` component
- Add new `Input` component
- Add new `Textarea` component
- Add new `Select` component
- Add new `Field`, `Label`, `Description`, `Fieldset` and `Legend` components
- Add new `DataInteractive` component
- Add new `anchor` and `modal` prop to `ComboboxOptions`, `ListboxOptions`, `MenuItems` and `PopoverPanel` components
- Add new `ListboxSelectedOption` component
- Add new `MenuSection`, `MenuHeading`, and `MenuSeparator` components
- Add new simplified `data-*` attributes as an alternative to the existing `data-headlessui-state="..."` attribute
- Add `autoFocus` prop on focusable components (which maps to `data-autofocus`)

### Changed

- Bumped to React and React DOM 18
- Dialog is focused by default instead of the first focusable element (unless an element exists with a `data-autofocus` in the dialog)

### Fixed

- Don't call `<Dialog>`'s `onClose` twice on mobile devices ([#2690](https://github.com/tailwindlabs/headlessui/pull/2690))
- Lazily resolve default containers in `<Dialog>` ([#2697](https://github.com/tailwindlabs/headlessui/pull/2697))
- Ensure hidden `Tab.Panel` components are hidden from the accessibility tree ([#2708](https://github.com/tailwindlabs/headlessui/pull/2708))
- Add support for `role="alertdialog"` to `<Dialog>` component ([#2709](https://github.com/tailwindlabs/headlessui/pull/2709))
- Ensure blurring the `Combobox.Input` component closes the `Combobox` ([#2712](https://github.com/tailwindlabs/headlessui/pull/2712))
- Allow changes to the `className` prop when the `<Transition />` component is currently not transitioning ([#2722](https://github.com/tailwindlabs/headlessui/pull/2722))
- Export (internal-only) component interfaces for TypeScript compiler ([#2313](https://github.com/tailwindlabs/headlessui/pull/2313))
- Fix infinite render-loop for `<Disclosure.Panel>` and `<Popover.Panel>` when `as={Fragment}` ([#2760](https://github.com/tailwindlabs/headlessui/pull/2760))
- Fix VoiceOver bug for `Listbox` component in Chrome ([#2824](https://github.com/tailwindlabs/headlessui/pull/2824))
- Fix outside click detection when component is mounted in the Shadow DOM ([#2866](https://github.com/tailwindlabs/headlessui/pull/2866))
- Fix CJS types ([#2880](https://github.com/tailwindlabs/headlessui/pull/2880))
- Fix error when transition classes contain new lines ([#2871](https://github.com/tailwindlabs/headlessui/pull/2871))
- Fix iOS scroll lock glitches

## [1.7.17] - 2023-08-17

### Fixed

- Use correct value when resetting `<Listbox multiple>` and `<Combobox multiple>` ([#2626](https://github.com/tailwindlabs/headlessui/pull/2626))
- Render `<MainTreeNode />` in `Popover.Group` component only ([#2634](https://github.com/tailwindlabs/headlessui/pull/2634))
- Disable smooth scrolling when opening/closing `Dialog` components on iOS ([#2635](https://github.com/tailwindlabs/headlessui/pull/2635))
- Don't assume `<Tab />` components are available when setting the next index ([#2642](https://github.com/tailwindlabs/headlessui/pull/2642))
- Fix incorrectly focused `Combobox.Input` component on page load ([#2654](https://github.com/tailwindlabs/headlessui/pull/2654))
- Ensure `appear` works using the `Transition` component (even when used with SSR) ([#2646](https://github.com/tailwindlabs/headlessui/pull/2646))
- Improve resetting values when using the `nullable` prop on the `Combobox` component ([#2660](https://github.com/tailwindlabs/headlessui/pull/2660))
- Fix hydration of components inside `<Suspense>` ([#2663](https://github.com/tailwindlabs/headlessui/pull/2663))
- Prevent scrolling when focusing a tab ([#2674](https://github.com/tailwindlabs/headlessui/pull/2674))

## [1.7.16] - 2023-07-27

### Fixed

- Ensure the caret is in a consistent position when syncing the `Combobox.Input` value ([#2568](https://github.com/tailwindlabs/headlessui/pull/2568))
- Improve "outside click" behaviour in combination with 3rd party libraries ([#2572](https://github.com/tailwindlabs/headlessui/pull/2572))
- Ensure IME works on Android devices ([#2580](https://github.com/tailwindlabs/headlessui/pull/2580))
- Calculate `aria-expanded` purely based on the open/closed state ([#2610](https://github.com/tailwindlabs/headlessui/pull/2610))
- Submit form on `Enter` even if no submit-like button was found ([#2613](https://github.com/tailwindlabs/headlessui/pull/2613))

## [1.7.15] - 2023-06-01

### Added

- [internal] add demo mode to `Menu` and `Popover` components ([#2448](https://github.com/tailwindlabs/headlessui/pull/2448))

### Fixed

- Ensure `FocusTrap` is only active when the given `enabled` value is `true` ([#2456](https://github.com/tailwindlabs/headlessui/pull/2456))
- Stop `<Transition appear>` from overwriting classes on re-render ([#2457](https://github.com/tailwindlabs/headlessui/pull/2457))
- Improve control over `Menu` and `Listbox` options while searching ([#2471](https://github.com/tailwindlabs/headlessui/pull/2471))
- Consider clicks inside iframes to be "outside" ([#2485](https://github.com/tailwindlabs/headlessui/pull/2485))
- Ensure moving focus within a `Portal` component, does not close the `Popover` component ([#2492](https://github.com/tailwindlabs/headlessui/pull/2492))

### Changed

- Move `types` condition to the front ([#2469](https://github.com/tailwindlabs/headlessui/pull/2469))

## [1.7.14] - 2023-04-12

### Fixed

- Fix focus styles showing up when using the mouse ([#2347](https://github.com/tailwindlabs/headlessui/pull/2347))
- Fix "Can't perform a React state update on an unmounted component." when using the `Transition` component ([#2374](https://github.com/tailwindlabs/headlessui/pull/2374))
- Add `FocusTrap` event listeners once document has loaded ([#2389](https://github.com/tailwindlabs/headlessui/pull/2389))
- Fix `className` hydration for `<Transition appear>` ([#2390](https://github.com/tailwindlabs/headlessui/pull/2390))
- Improve `Combobox` types to improve false positives ([#2411](https://github.com/tailwindlabs/headlessui/pull/2411))
- Merge `className` correctly when it’s a function ([#2412](https://github.com/tailwindlabs/headlessui/pull/2412))
- Correctly handle IME composition in `<Combobox.Input>` ([#2426](https://github.com/tailwindlabs/headlessui/pull/2426))

### Added

- Add `form` prop to form-like components such as `RadioGroup`, `Switch`, `Listbox`, and `Combobox` ([#2356](https://github.com/tailwindlabs/headlessui/pull/2356))

## [1.7.13] - 2023-03-03

### Fixed

- Ensure `Transition` component completes if nothing is transitioning ([#2318](https://github.com/tailwindlabs/headlessui/pull/2318))
- Enable native label behavior for `<Switch>` where possible ([#2265](https://github.com/tailwindlabs/headlessui/pull/2265))
- Allow root containers from the `Dialog` component in the `FocusTrap` component ([#2322](https://github.com/tailwindlabs/headlessui/pull/2322))
- Fix `XYZPropsWeControl` and cleanup internal TypeScript types ([#2329](https://github.com/tailwindlabs/headlessui/pull/2329))
- Fix invalid warning when using multiple `Popover.Button` components inside a `Popover.Panel` ([#2333](https://github.com/tailwindlabs/headlessui/pull/2333))
- Fix restore focus to buttons in Safari, when `Dialog` component closes ([#2326](https://github.com/tailwindlabs/headlessui/pull/2326))

## [1.7.12] - 2023-02-24

### Added

- Add explicit props types for every component ([#2282](https://github.com/tailwindlabs/headlessui/pull/2282))

### Fixed

- Ensure the main tree and parent `Dialog` components are marked as `inert` ([#2290](https://github.com/tailwindlabs/headlessui/pull/2290))
- Fix nested `Popover` components not opening ([#2293](https://github.com/tailwindlabs/headlessui/pull/2293))
- Make React types more compatible with other libraries ([#2282](https://github.com/tailwindlabs/headlessui/pull/2282))
- Fix `Dialog` cleanup when the `Dialog` becomes hidden ([#2303](https://github.com/tailwindlabs/headlessui/pull/2303))

## [1.7.11] - 2023-02-15

### Fixed

- Ensure we handle `null` values for the `dataRef` correctly ([#2258](https://github.com/tailwindlabs/headlessui/pull/2258))
- Move `aria-multiselectable` to `[role=listbox]` in the `Combobox` component ([#2271](https://github.com/tailwindlabs/headlessui/pull/2271))
- Re-focus `Combobox.Input` when a `Combobox.Option` is selected ([#2272](https://github.com/tailwindlabs/headlessui/pull/2272))
- Ensure we reset the `activeOptionIndex` if the active option is unmounted ([#2274](https://github.com/tailwindlabs/headlessui/pull/2274))
- Improve `Ref` type for forwarded `Switch`'s ref ([#2277](https://github.com/tailwindlabs/headlessui/pull/2277))
- Start cleanup phase of the `Dialog` component when going into the `Closing` state ([#2264](https://github.com/tailwindlabs/headlessui/pull/2264))

## [1.7.10] - 2023-02-06

### Fixed

- Revert "Use the `import * as React from 'react'` pattern ([#2242](https://github.com/tailwindlabs/headlessui/pull/2242))

## [1.7.9] - 2023-02-03

### Fixed

- Fix SSR tab hydration when using Strict Mode in development ([#2231](https://github.com/tailwindlabs/headlessui/pull/2231))
- Don't break overflow when multiple dialogs are open at the same time ([#2215](https://github.com/tailwindlabs/headlessui/pull/2215))
- Fix "This `Suspense` boundary received an update before it finished hydrating" error in the `Disclosure` component ([#2238](https://github.com/tailwindlabs/headlessui/pull/2238))
- Use the `import * as React from 'react'` pattern ([#2242](https://github.com/tailwindlabs/headlessui/pull/2242))

## [1.7.8] - 2023-01-27

### Fixed

- Fix SSR tab rendering on React 17 ([#2102](https://github.com/tailwindlabs/headlessui/pull/2102))
- Fix arrow key handling in `Tab` (after DOM order changes) ([#2145](https://github.com/tailwindlabs/headlessui/pull/2145))
- Fix false positive warning about using multiple `<Popover.Button>` components ([#2146](https://github.com/tailwindlabs/headlessui/pull/2146))
- Fix `Tab` key with non focusable elements in `Popover.Panel` ([#2147](https://github.com/tailwindlabs/headlessui/pull/2147))
- Fix false positive warning when using `<Popover.Button />` in React 17 ([#2163](https://github.com/tailwindlabs/headlessui/pull/2163))
- Fix `failed to removeChild on Node` bug ([#2164](https://github.com/tailwindlabs/headlessui/pull/2164))
- Don’t overwrite classes during SSR when rendering fragments ([#2173](https://github.com/tailwindlabs/headlessui/pull/2173))
- Improve `Combobox` accessibility ([#2153](https://github.com/tailwindlabs/headlessui/pull/2153))
- Fix crash when reading `headlessuiFocusGuard` of `relatedTarget` in the `FocusTrap` component ([#2203](https://github.com/tailwindlabs/headlessui/pull/2203))
- Fix `FocusTrap` in `Dialog` when there is only 1 focusable element ([#2172](https://github.com/tailwindlabs/headlessui/pull/2172))
- Improve `Tabs` wrapping around when controlling the component and overflowing the `selectedIndex` ([#2213](https://github.com/tailwindlabs/headlessui/pull/2213))
- Fix `shadow-root` bug closing `Dialog` containers ([#2217](https://github.com/tailwindlabs/headlessui/pull/2217))

### Added

- Allow setting `tabIndex` on the `Tab.Panel` ([#2214](https://github.com/tailwindlabs/headlessui/pull/2214))

## [1.7.7] - 2022-12-16

### Fixed

- Improve scroll restoration after `Dialog` closes ([b20e48dd](https://github.com/tailwindlabs/headlessui/commit/b20e48dde3c37867f3900be3d475f9ac2058b587))

## [1.7.6] - 2022-12-15

### Fixed

- Fix regression where `displayValue` crashes ([#2087](https://github.com/tailwindlabs/headlessui/pull/2087))
- Fix `displayValue` syncing when `Combobox.Input` is unmounted and re-mounted in different trees ([#2090](https://github.com/tailwindlabs/headlessui/pull/2090))
- Fix FocusTrap escape due to strange tabindex values ([#2093](https://github.com/tailwindlabs/headlessui/pull/2093))
- Improve scroll locking on iOS ([#2100](https://github.com/tailwindlabs/headlessui/pull/2100), [28234b0e](https://github.com/tailwindlabs/headlessui/commit/28234b0e37633c0e2ec62ac8bd12320207a5d02b))

## [1.7.5] - 2022-12-08

### Fixed

- Reset form-like components when the parent `<form>` resets ([#2004](https://github.com/tailwindlabs/headlessui/pull/2004))
- Add warning when using `<Popover.Button />` multiple times ([#2007](https://github.com/tailwindlabs/headlessui/pull/2007))
- Ensure Popover doesn't crash when `focus` is going to `window` ([#2019](https://github.com/tailwindlabs/headlessui/pull/2019))
- Ensure `shift+home` and `shift+end` works as expected in the `Combobox.Input` component ([#2024](https://github.com/tailwindlabs/headlessui/pull/2024))
- Improve syncing of the `Combobox.Input` value ([#2042](https://github.com/tailwindlabs/headlessui/pull/2042))
- Fix crash when using `multiple` mode without `value` prop (uncontrolled) for `Listbox` and `Combobox` components ([#2058](https://github.com/tailwindlabs/headlessui/pull/2058))
- Apply `enter` and `enterFrom` classes in SSR for `Transition` component ([#2059](https://github.com/tailwindlabs/headlessui/pull/2059))
- Allow passing in your own `id` prop ([#2060](https://github.com/tailwindlabs/headlessui/pull/2060))
- Fix `Dialog` unmounting problem due to incorrect `transitioncancel` event in the `Transition` component on Android ([#2071](https://github.com/tailwindlabs/headlessui/pull/2071))
- Ignore pointer events in Listbox, Menu, and Combobox when cursor hasn't moved ([#2069](https://github.com/tailwindlabs/headlessui/pull/2069))
- Allow clicks inside dialog panel when target is inside shadow root ([#2079](https://github.com/tailwindlabs/headlessui/pull/2079))

## [1.7.4] - 2022-11-03

### Fixed

- Fix `<Popover.Button as={Fragment} />` crash ([#1889](https://github.com/tailwindlabs/headlessui/pull/1889))
- Expose `close` function for `Menu` and `Menu.Item` components ([#1897](https://github.com/tailwindlabs/headlessui/pull/1897))
- Fix `useOutsideClick`, add improvements for ShadowDOM ([#1914](https://github.com/tailwindlabs/headlessui/pull/1914))
- Fire `<Combobox.Input>`'s `onChange` handler when changing the value internally ([#1916](https://github.com/tailwindlabs/headlessui/pull/1916))
- Add `client-only` to mark everything as client components ([#1981](https://github.com/tailwindlabs/headlessui/pull/1981))

### Added

- Warn when changing components between controlled and uncontrolled ([#1878](https://github.com/tailwindlabs/headlessui/issues/1878))

## [1.7.3] - 2022-09-30

### Fixed

- Improve `Portal` detection for `Popover` components ([#1842](https://github.com/tailwindlabs/headlessui/pull/1842))
- Fix `useOutsideClick` swallowing events inside ShadowDOM ([#1876](https://github.com/tailwindlabs/headlessui/pull/1876))
- Fix `Tab` incorrectly activating on `focus` event ([#1887](https://github.com/tailwindlabs/headlessui/pull/1887))

## [1.7.2] - 2022-09-15

### Fixed

- Prevent option selection in `Combobox.Input` while composing ([#1850](https://github.com/tailwindlabs/headlessui/issues/1850))
- Ensure we handle the `static` prop in `Tab.Panel` components correctly ([#1856](https://github.com/tailwindlabs/headlessui/pull/1856))

## [1.7.1] - 2022-09-12

### Fixed

- Improve iOS scroll locking ([#1830](https://github.com/tailwindlabs/headlessui/pull/1830))
- Add `<fieldset disabled>` check to radio group options in React ([#1835](https://github.com/tailwindlabs/headlessui/pull/1835))
- Ensure `Tab` order stays consistent, and the currently active `Tab` stays active ([#1837](https://github.com/tailwindlabs/headlessui/pull/1837))
- Ensure `Combobox.Label` is properly linked when rendered after `Combobox.Button` and `Combobox.Input` components ([#1838](https://github.com/tailwindlabs/headlessui/pull/1838))
- Remove `forceRerender` from `Tab` component ([#1846](https://github.com/tailwindlabs/headlessui/pull/1846))

## [1.7.0] - 2022-09-06

### Added

- Add `by` prop for `Listbox`, `Combobox` and `RadioGroup` ([#1482](https://github.com/tailwindlabs/headlessui/pull/1482), [#1717](https://github.com/tailwindlabs/headlessui/pull/1717), [#1814](https://github.com/tailwindlabs/headlessui/pull/1814), [#1815](https://github.com/tailwindlabs/headlessui/pull/1815))
- Make form components uncontrollable ([#1683](https://github.com/tailwindlabs/headlessui/pull/1683))
- Add `@headlessui/tailwindcss` plugin ([#1487](https://github.com/tailwindlabs/headlessui/pull/1487))

### Fixed

- Fixed SSR support on Deno ([#1671](https://github.com/tailwindlabs/headlessui/pull/1671))
- Don’t close dialog when opened during mouse up event ([#1667](https://github.com/tailwindlabs/headlessui/pull/1667))
- Don’t close dialog when drag ends outside dialog ([#1667](https://github.com/tailwindlabs/headlessui/pull/1667))
- Fix outside clicks to close dialog when nested, unopened dialogs are present ([#1667](https://github.com/tailwindlabs/headlessui/pull/1667))
- Close `Menu` component when using `tab` key ([#1673](https://github.com/tailwindlabs/headlessui/pull/1673))
- Resync input when display value changes ([#1679](https://github.com/tailwindlabs/headlessui/pull/1679), [#1755](https://github.com/tailwindlabs/headlessui/pull/1755))
- Ensure controlled `Tabs` don't change automagically ([#1680](https://github.com/tailwindlabs/headlessui/pull/1680))
- Don't scroll lock when a Transition + Dialog is mounted but hidden ([#1681](https://github.com/tailwindlabs/headlessui/pull/1681))
- Allow `Popover` `close` to be passed directly to `onClick` handlers ([#1696](https://github.com/tailwindlabs/headlessui/pull/1696))
- Improve outside click on Safari iOS ([#1712](https://github.com/tailwindlabs/headlessui/pull/1712))
- Improve event handler merging ([#1715](https://github.com/tailwindlabs/headlessui/pull/1715))
- Fix incorrect scrolling to the bottom when opening a `Dialog` ([#1716](https://github.com/tailwindlabs/headlessui/pull/1716))
- Improve `Combobox` re-opening keyboard issue on mobile ([#1732](https://github.com/tailwindlabs/headlessui/pull/1732))
- Ensure `Disclosure.Panel` is properly linked ([#1747](https://github.com/tailwindlabs/headlessui/pull/1747))
- Only select the active option when using "singular" mode when pressing `<tab>` in the `Combobox` component ([#1750](https://github.com/tailwindlabs/headlessui/pull/1750))
- Improve the types of the `Combobox` component ([#1761](https://github.com/tailwindlabs/headlessui/pull/1761))
- Only restore focus to the `Menu.Button` if necessary when activating a `Menu.Option` ([#1782](https://github.com/tailwindlabs/headlessui/pull/1782))
- Don't scroll when wrapping around in focus trap ([#1789](https://github.com/tailwindlabs/headlessui/pull/1789))
- Fix `Transition` component's incorrect cleanup and order of events ([#1803](https://github.com/tailwindlabs/headlessui/pull/1803))
- Ensure enter transitions work when using `unmount={false}` ([#1811](https://github.com/tailwindlabs/headlessui/pull/1811))
- Improve accessibility when announcing `Listbox.Option` and `Combobox.Option` components ([#1812](https://github.com/tailwindlabs/headlessui/pull/1812))
- Fix `ref` stealing from children ([#1820](https://github.com/tailwindlabs/headlessui/pull/1820))
- Expose the `value` from the `Combobox` and `Listbox` components render prop ([#1822](https://github.com/tailwindlabs/headlessui/pull/1822))
- Improve `scroll lock` on iOS ([#1824](https://github.com/tailwindlabs/headlessui/pull/1824))
- Fix maximum call stack size exceeded error on `Tab` component when using `as={Fragment}` ([#1826](https://github.com/tailwindlabs/headlessui/pull/1826))
- Fix "blank" screen on initial load of `Transition` component ([#1823](https://github.com/tailwindlabs/headlessui/pull/1823))

## [1.6.6] - 2022-07-07

### Fixed

- Ensure `CMD`+`Backspace` works in nullable mode for `Combobox` component ([#1617](https://github.com/tailwindlabs/headlessui/pull/1617))

## [1.6.5] - 2022-06-20

### Fixed

- Fix incorrect transitionend/transitioncancel events for the Transition component ([#1537](https://github.com/tailwindlabs/headlessui/pull/1537))
- Improve outside click of `Dialog` component ([#1546](https://github.com/tailwindlabs/headlessui/pull/1546))
- Detect outside clicks from within `<iframe>` elements ([#1552](https://github.com/tailwindlabs/headlessui/pull/1552))
- Improve Combobox input cursor position ([#1574](https://github.com/tailwindlabs/headlessui/pull/1574))
- Fix scrolling issue in `Tab` component when using arrow keys ([#1584](https://github.com/tailwindlabs/headlessui/pull/1584))

## [1.6.4] - 2022-05-29

### Fixed

- Ensure `Escape` propagates correctly in `Combobox` component ([#1511](https://github.com/tailwindlabs/headlessui/pull/1511))
- Remove leftover code in Combobox component ([#1514](https://github.com/tailwindlabs/headlessui/pull/1514))
- Fix event handlers with arity > 1 ([#1515](https://github.com/tailwindlabs/headlessui/pull/1515))
- Fix transition `enter` bug ([#1519](https://github.com/tailwindlabs/headlessui/pull/1519))
- Fix render prop data in `RadioGroup` component ([#1522](https://github.com/tailwindlabs/headlessui/pull/1522))

## [1.6.3] - 2022-05-25

### Fixed

- Allow to override the `type` on the `Combobox.Input` ([#1476](https://github.com/tailwindlabs/headlessui/pull/1476))
- Ensure the the `<Popover.Panel focus>` closes correctly ([#1477](https://github.com/tailwindlabs/headlessui/pull/1477))
- Only render the `FocusSentinel` if required in the `Tabs` component ([#1493](https://github.com/tailwindlabs/headlessui/pull/1493))
- Ensure the Transition stops once DOM Nodes are hidden ([#1500](https://github.com/tailwindlabs/headlessui/pull/1500))

## [1.6.2] - 2022-05-19

### Fixed

- Fix closing of `Popover.Panel` in React 18 ([#1409](https://github.com/tailwindlabs/headlessui/pull/1409))
- Ignore `Escape` when event got prevented in `Dialog` component ([#1424](https://github.com/tailwindlabs/headlessui/pull/1424))
- Improve `FocusTrap` behaviour ([#1432](https://github.com/tailwindlabs/headlessui/pull/1432))
- Simplify `Popover` Tab logic by using sentinel nodes instead of keydown event interception ([#1440](https://github.com/tailwindlabs/headlessui/pull/1440))
- Ensure the `Popover.Panel` is clickable without closing the `Popover` ([#1443](https://github.com/tailwindlabs/headlessui/pull/1443))
- Improve "Scroll lock" scrollbar width for `Dialog` component ([#1457](https://github.com/tailwindlabs/headlessui/pull/1457))
- Make the `ref` optional in the `Popover` component ([#1465](https://github.com/tailwindlabs/headlessui/pull/1465))
- Ensure the `ref` is forwarded on the `Transition.Child` component ([#1473](https://github.com/tailwindlabs/headlessui/pull/1473))

## [1.6.1] - 2022-05-03

### Fixed

- Fix hydration issue with `Tab` component ([#1393](https://github.com/tailwindlabs/headlessui/pull/1393))

## [1.6.0] - 2022-04-25

### Fixed

- Ensure that you can add the `ref` prop to all components ([#1116](https://github.com/tailwindlabs/headlessui/pull/1116))
- Ensure links are triggered inside `Popover.Panel` components ([#1153](https://github.com/tailwindlabs/headlessui/pull/1153))
- Improve SSR for `Tab` component ([#1155](https://github.com/tailwindlabs/headlessui/pull/1155))
- Fix `hover` scroll issue in `Listbox`, `Combobox` and `Menu` components ([#1161](https://github.com/tailwindlabs/headlessui/pull/1161))
- Guarantee DOM sort order when performing `Listbox`, `Combobox` and `Menu` actions ([#1168](https://github.com/tailwindlabs/headlessui/pull/1168))
- Fix `<Transition>` flickering issue ([#1118](https://github.com/tailwindlabs/headlessui/pull/1118))
- Improve outside click support ([#1175](https://github.com/tailwindlabs/headlessui/pull/1175))
- Ensure that `appear` prop on the `<Transition>` component works regardless of multiple rerenders ([#1179](https://github.com/tailwindlabs/headlessui/pull/1179))
- Reset `Combobox.Input` when the value gets reset ([#1181](https://github.com/tailwindlabs/headlessui/pull/1181))
- Fix double `beforeEnter` callback on the `<Transition>` component caused by SSR ([#1183](https://github.com/tailwindlabs/headlessui/pull/1183))
- Adjust active `item`/`option` index on `Listbox`, `Combobox` and `Menu` components ([#1184](https://github.com/tailwindlabs/headlessui/pull/1184))
- Only activate the `Tab` on mouseup ([#1192](https://github.com/tailwindlabs/headlessui/pull/1192))
- Ignore "outside click" on removed elements ([#1193](https://github.com/tailwindlabs/headlessui/pull/1193))
- Remove `focus()` from `Listbox.Option` ([#1218](https://github.com/tailwindlabs/headlessui/pull/1218))
- Improve some internal code ([#1221](https://github.com/tailwindlabs/headlessui/pull/1221))
- Use `ownerDocument` instead of `document` ([#1158](https://github.com/tailwindlabs/headlessui/pull/1158))
- Ensure focus trapping plays well with the `Tab` and `Dialog` components ([#1231](https://github.com/tailwindlabs/headlessui/pull/1231))
- Improve syncing of `Combobox.Input` value ([#1248](https://github.com/tailwindlabs/headlessui/pull/1248))
- Fix tree-shaking support ([#1247](https://github.com/tailwindlabs/headlessui/pull/1247))
- Stop propagation on the `Popover.Button` ([#1263](https://github.com/tailwindlabs/headlessui/pull/1263))
- Fix incorrect `active` option in the `Listbox` and `Combobox` components ([#1264](https://github.com/tailwindlabs/headlessui/pull/1264))
- Properly merge incoming props ([#1265](https://github.com/tailwindlabs/headlessui/pull/1265))
- Fix incorrect closing while interacting with third party libraries in `Dialog` component ([#1268](https://github.com/tailwindlabs/headlessui/pull/1268))
- Mimic browser select on focus when navigating the `Tab` component ([#1272](https://github.com/tailwindlabs/headlessui/pull/1272))
- Ensure that there is always an active option in the `Combobox` ([#1279](https://github.com/tailwindlabs/headlessui/pull/1279), [#1281](https://github.com/tailwindlabs/headlessui/pull/1281))
- Support classic form submissions in `RadioGroup`, `Switch` and `Combobox` components ([#1285](https://github.com/tailwindlabs/headlessui/pull/1285))
- Add React 18 compatibility ([#1326](https://github.com/tailwindlabs/headlessui/pull/1326))
- Fix open/closed state issue in `Dialog` ([#1360](https://github.com/tailwindlabs/headlessui/pull/1360))

### Added

- Add classic form submission compatibility via new hidden inputs ([#1214](https://github.com/tailwindlabs/headlessui/pull/1214))
- Add multiple value support to `Listbox` and `Combobox` components ([#1243](https://github.com/tailwindlabs/headlessui/pull/1243), [#1355](https://github.com/tailwindlabs/headlessui/pull/1355))
- Add support for clearing the value of a `Combobox` ([#1295](https://github.com/tailwindlabs/headlessui/pull/1295))
- Add `Dialog.Backdrop` and `Dialog.Panel` components ([#1333](https://github.com/tailwindlabs/headlessui/pull/1333))

## [1.5.0] - 2022-02-17

### Fixed

- Ensure correct order when conditionally rendering `Menu.Item`, `Listbox.Option` and `RadioGroup.Option` ([#1045](https://github.com/tailwindlabs/headlessui/pull/1045))
- Improve controlled Tabs behaviour ([#1050](https://github.com/tailwindlabs/headlessui/pull/1050))
- Improve typeahead search logic ([#1051](https://github.com/tailwindlabs/headlessui/pull/1051))
- Improve overal codebase, use modern tech like `esbuild` and TypeScript 4! ([#1055](https://github.com/tailwindlabs/headlessui/pull/1055))
- Improve build files ([#1078](https://github.com/tailwindlabs/headlessui/pull/1078))
- Ensure typeahead stays on same item if it still matches ([#1098](https://github.com/tailwindlabs/headlessui/pull/1098))
- Fix off-by-one frame issue causing flicker ([#1111](https://github.com/tailwindlabs/headlessui/pull/1111))
- Trigger scrollIntoView effect when position changes ([#1113](https://github.com/tailwindlabs/headlessui/pull/1113))

### Added

- Add `Combobox` component ([#1047](https://github.com/tailwindlabs/headlessui/pull/1047), [#1099](https://github.com/tailwindlabs/headlessui/pull/1099), [#1101](https://github.com/tailwindlabs/headlessui/pull/1101), [#1104](https://github.com/tailwindlabs/headlessui/pull/1104), [#1109](https://github.com/tailwindlabs/headlessui/pull/1109))

## [1.4.3] - 2022-01-14

### Fixes

- Ensure portal root exists in the DOM ([#950](https://github.com/tailwindlabs/headlessui/pull/950))
- Ensure correct DOM node order when performing focus actions ([#1038](https://github.com/tailwindlabs/headlessui/pull/1038))

### Added

- Allow for `Tab.Group` to be controllable ([#909](https://github.com/tailwindlabs/headlessui/pull/909), [#970](https://github.com/tailwindlabs/headlessui/pull/970))

## [1.4.2] - 2021-11-08

### Fixes

- Stop the event from propagating in the `Popover` component ([#798](https://github.com/tailwindlabs/headlessui/pull/798))
- Allow clicking on elements inside a `Dialog.Overlay` ([#816](https://github.com/tailwindlabs/headlessui/pull/816))
- Ensure interactability with `Popover.Panel` contents when using the `static` prop ([#857](https://github.com/tailwindlabs/headlessui/pull/857))
- Fix initial transition in `Transition` component ([#882](https://github.com/tailwindlabs/headlessui/pull/882))

## [1.4.1] - 2021-08-30

### Fixes

- Only add `type=button` to real buttons ([#709](https://github.com/tailwindlabs/headlessui/pull/709))
- Fix `escape` bug not closing Dialog after clicking in Dialog ([#754](https://github.com/tailwindlabs/headlessui/pull/754))
- Use `console.warn` instead of throwing an error when there are no focusable elements ([#775](https://github.com/tailwindlabs/headlessui/pull/775))

## [1.4.0] - 2021-07-29

### Added

- Add new `Tabs` component ([#674](https://github.com/tailwindlabs/headlessui/pull/674), [#698](https://github.com/tailwindlabs/headlessui/pull/698))
- Make `Disclosure.Button` close the disclosure inside a `Disclosure.Panel` ([#682](https://github.com/tailwindlabs/headlessui/pull/682))
- Add `aria-orientation` to `Listbox`, which swaps Up/Down with Left/Right keys ([#683](https://github.com/tailwindlabs/headlessui/pull/683))
- Expose `close` function from the render prop for `Disclosure`, `Disclosure.Panel`, `Popover` and `Popover.Panel` ([#697](https://github.com/tailwindlabs/headlessui/pull/697))

## [1.3.0] - 2021-06-21

### Added

- Ensure that you can use `Transition.Child` when using implicit Transitions ([#503](https://github.com/tailwindlabs/headlessui/pull/503))
- Add new `entered` prop for `Transition` and `Transition.Child` components ([#504](https://github.com/tailwindlabs/headlessui/pull/504))

### Fixes

- Add `aria-disabled` on disabled `RadioGroup.Option` components ([#543](https://github.com/tailwindlabs/headlessui/pull/543))
- Improve `disabled` and `tabindex` prop handling ([#512](https://github.com/tailwindlabs/headlessui/pull/512))
- Improve React peer dependency version range ([#544](https://github.com/tailwindlabs/headlessui/pull/544))
- Improve types for the `open` prop in the `Dialog` component ([#550](https://github.com/tailwindlabs/headlessui/pull/550))
- Improve `aria-expanded` logic ([#592](https://github.com/tailwindlabs/headlessui/pull/592))
- Remove undocumented `:className` prop ([#607](https://github.com/tailwindlabs/headlessui/pull/607))
- Improve types for `Listbox` component ([#576](https://github.com/tailwindlabs/headlessui/pull/576))
- Remove explicit `:class` prop ([#608](https://github.com/tailwindlabs/headlessui/pull/608))
- Improve tree shaking ([#602](https://github.com/tailwindlabs/headlessui/pull/602))
- Improve peer dependencies for `react-dom`, and for the future version `18` ([#622](https://github.com/tailwindlabs/headlessui/pull/622))

## [1.2.0] - 2021-05-10

### Added

- Introduce Open/Closed state, to simplify component communication ([#466](https://github.com/tailwindlabs/headlessui/pull/466))

### Fixes

- Improve SSR for `Dialog` ([#477](https://github.com/tailwindlabs/headlessui/pull/477))
- Delay focus trap initialization ([#477](https://github.com/tailwindlabs/headlessui/pull/477))
- Improve incorrect behaviour for nesting `Dialog` components ([#560](https://github.com/tailwindlabs/headlessui/pull/560))

## [1.1.1] - 2021-04-28

### Fixes

- Fix form submission within Dialog ([#460](https://github.com/tailwindlabs/headlessui/pull/460))

## [1.1.0] - 2021-04-26

### Fixes

- Improve search, make searching case insensitive ([#385](https://github.com/tailwindlabs/headlessui/pull/385))
- Fix unreachable `RadioGroup` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Fix closing nested `Dialog` components when pressing `Escape` ([#430](https://github.com/tailwindlabs/headlessui/pull/430))

### Added

- Add `disabled` prop to `RadioGroup` and `RadioGroup.Option` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Add `defaultOpen` prop to the `Disclosure` component ([#447](https://github.com/tailwindlabs/headlessui/pull/447))

## [1.0.0] - 2021-04-14

### Fixes

- Fixed `outside click` not re-focusing the `Menu.Button` ([#220](https://github.com/tailwindlabs/headlessui/pull/220), [#256](https://github.com/tailwindlabs/headlessui/pull/256))
- Fixed `outside click` not re-focusing the `Listbox.Button` ([#220](https://github.com/tailwindlabs/headlessui/pull/220), [#256](https://github.com/tailwindlabs/headlessui/pull/256))
- Force focus in `Menu.Items` and `Listbox.Options` from within the component itself ([#261](https://github.com/tailwindlabs/headlessui/pull/261))
- Stop propagating keyboard/mouse events ([#261](https://github.com/tailwindlabs/headlessui/pull/261))

### Added

- Add `Disclosure`, `Disclosure.Button` and `Disclosure.Panel` components ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `Dialog`, `Dialog.Overlay`, `Dialog.Tile` and `Dialog.Description` components ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `Portal` and `Portal.Group` component ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `Switch.Description` component, which adds the `aria-describedby` to the actual Switch ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `FocusTrap` component ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `Popover`, `Popover.Button`, `Popover.Overlay`, `Popover.Panel` and `Popover.Group` components ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- All components that accept a `className`, can now also receive a function with the renderProp argument ([#257](https://github.com/tailwindlabs/headlessui/pull/257))
- Add `RadioGroup`, `RadioGroup.Option`, `RadioGroup.Label` and `RadioGroup.Description` components ([#274](https://github.com/tailwindlabs/headlessui/pull/274))

## [0.3.2] - 2021-04-02

### Fixes

- Fix incorrect type error `unique symbol` ([#248](https://github.com/tailwindlabs/headlessui/pull/248), [#240](https://github.com/tailwindlabs/headlessui/issues/240))

## [0.3.1] - 2021-02-11

### Fixes

- Fix incorrect `types` path ([d557d50](https://github.com/tailwindlabs/headlessui/commit/d557d5013968f7bb9877f190b682318704043905))
- Fix TypeScript render related types ([bb68793](https://github.com/tailwindlabs/headlessui/commit/bb68793f08a57833095a38519b639a744076dc69))

## [0.3.0] - 2021-02-06

### Fixes

- Ensure that you can't use Enter to invoke the Switch
- Fix outside click refocus bug ([#114](https://github.com/tailwindlabs/headlessui/pull/114))
- Prevent scrolling when refocusing items
- Ensure `Switch` has `type="button"` ([#192](https://github.com/tailwindlabs/headlessui/pull/192))
- Fix `useId()` hook returning `undefined` on the client
- Fix `disabled` not working when inside a disabled fieldset ([#202](https://github.com/tailwindlabs/headlessui/pull/202))
- Trigger "outside click" behaviour on mousedown ([#212](https://github.com/tailwindlabs/headlessui/pull/212))
- Ensure the `active` MenuItem is scrolled into view
- Ensure valid Menu accessibility tree ([#228](https://github.com/tailwindlabs/headlessui/pull/228))

### Added

- Add Transition events (`beforeEnter`, `afterEnter`, `beforeLeave` and `afterLeave`) ([#57](https://github.com/tailwindlabs/headlessui/pull/57))
- Add render features + render strategy (`static` and `unmount={true | false}`) ([#106](https://github.com/tailwindlabs/headlessui/pull/106))
- Add displayName to all contexts ([#175](https://github.com/tailwindlabs/headlessui/pull/175))
- Add `disabled` prop to `Listbox` itself, instead of the `Listbox.Button` ([#229](https://github.com/tailwindlabs/headlessui/pull/229))

### Changes

- Changes the API of the Transition component.
  - We will now always render a `div` by default (unless you change this using the `as={...}` prop).
  - The render function prop doesn't expose a `ref` anymore.
  - Adds `unmount` prop to the `Transition` and `Transition.Child` components.

## [0.2.0] - 2020-10-06

### Added

- Add `Listbox` component
- Add `Switch` component

## [0.1.3] - 2020-09-29

### Fixes

- Fix outside click behaviour. If you had multiple menu's, when menu 1 is open, menu 2 is closed and you click on menu button 2 it will open both menu's. This is now fixed.
- Ensure when using keyboard navigation we prevent the default behaviour.

## [0.1.2] - 2020-09-25

### Added

- Add tests for `onClick` handling that wasn't working properly in @headlessui/vue to ensure behavior stays the same in this library

### Fixes

- Don't pass `disabled` prop through to children, only add `aria-disabled`

## [0.1.1] - 2020-09-24

### Added

- Everything!

[unreleased]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v2.0.0-alpha.3...HEAD
[2.0.0-alpha.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v2.0.0-alpha.2...v2.0.0-alpha.3
[2.0.0-alpha.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v2.0.0-alpha.1...v2.0.0-alpha.2
[2.0.0-alpha.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.17...v2.0.0-alpha.1
[1.7.17]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.16...v1.7.17
[1.7.16]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.15...@headlessui/react@v1.7.16
[1.7.15]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.14...@headlessui/react@v1.7.15
[1.7.14]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.13...@headlessui/react@v1.7.14
[1.7.13]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.12...@headlessui/react@v1.7.13
[1.7.12]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.11...@headlessui/react@v1.7.12
[1.7.11]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.10...@headlessui/react@v1.7.11
[1.7.10]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.9...@headlessui/react@v1.7.10
[1.7.9]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.8...@headlessui/react@v1.7.9
[1.7.8]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.7...@headlessui/react@v1.7.8
[1.7.7]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.6...@headlessui/react@v1.7.7
[1.7.6]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.5...@headlessui/react@v1.7.6
[1.7.5]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.4...@headlessui/react@v1.7.5
[1.7.4]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.3...@headlessui/react@v1.7.4
[1.7.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.2...@headlessui/react@v1.7.3
[1.7.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.1...@headlessui/react@v1.7.2
[1.7.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.7.0...@headlessui/react@v1.7.1
[1.7.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.6...@headlessui/react@v1.7.0
[1.6.6]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.5...@headlessui/react@v1.6.6
[1.6.5]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.4...@headlessui/react@v1.6.5
[1.6.4]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.3...@headlessui/react@v1.6.4
[1.6.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.2...@headlessui/react@v1.6.3
[1.6.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.1...@headlessui/react@v1.6.2
[1.6.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.6.0...@headlessui/react@v1.6.1
[1.6.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.5.0...@headlessui/react@v1.6.0
[1.5.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.3...@headlessui/react@v1.5.0
[1.4.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.2...@headlessui/react@v1.4.3
[1.4.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.1...@headlessui/react@v1.4.2
[1.4.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.0...@headlessui/react@v1.4.1
[1.4.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.3.0...@headlessui/react@v1.4.0
[1.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.2.0...@headlessui/react@v1.3.0
[1.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.1.1...@headlessui/react@v1.2.0
[1.1.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.1.0...@headlessui/react@v1.1.1
[1.1.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.0.0...@headlessui/react@v1.1.0
[1.0.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.2...@headlessui/react@v1.0.0
[0.3.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.1...@headlessui/react@v0.3.2
[0.3.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.0...@headlessui/react@v0.3.1
[0.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.2.0...@headlessui/react@v0.3.0
[0.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.3...@headlessui/react@v0.2.0
[0.1.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.2...@headlessui/react@v0.1.3
[0.1.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.1...@headlessui/react@v0.1.2
[0.1.1]: https://github.com/tailwindlabs/headlessui/releases/tag/@headlessui/react@v0.1.1
