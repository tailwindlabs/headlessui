# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Don't call `<Dialog>`'s `onClose` twice on mobile devices ([#2690](https://github.com/tailwindlabs/headlessui/pull/2690))
- Fix Portal SSR hydration mismatches ([#2700](https://github.com/tailwindlabs/headlessui/pull/2700))
- Ensure hidden `TabPanel` components are hidden from the accessibility tree ([#2708](https://github.com/tailwindlabs/headlessui/pull/2708))
- Add support for `role="alertdialog"` to `<Dialog>` component ([#2709](https://github.com/tailwindlabs/headlessui/pull/2709))
- Ensure blurring the `ComboboxInput` component closes the `Combobox` ([#2712](https://github.com/tailwindlabs/headlessui/pull/2712))
- Allow `<button>` to be in nested components in `<PopoverButton>` ([#2715](https://github.com/tailwindlabs/headlessui/pull/2715))
- Don't overwrite user-defined template refs when rendering ([#2720](https://github.com/tailwindlabs/headlessui/pull/2720))
- Fix missing `data-headlessui-state` attribute when `as="template"` ([#2787](https://github.com/tailwindlabs/headlessui/pull/2787))
- Fix VoiceOver bug for `Listbox` component in Chrome ([#2824](https://github.com/tailwindlabs/headlessui/pull/2824))
- Fix outside click detection when component is mounted in the Shadow DOM ([6846231](https://github.com/tailwindlabs/headlessui/commit/684623131b99d9e75dfc1c1f6d27244c334a95d9))
- Fix CJS types ([#2880](https://github.com/tailwindlabs/headlessui/pull/2880))
- Fix error when transition classes contain new lines ([#2871](https://github.com/tailwindlabs/headlessui/pull/2871))

### Added

- Add `immediate` prop to `<Combobox />` for immediately opening the Combobox when the `input` receives focus ([#2686](https://github.com/tailwindlabs/headlessui/pull/2686))
- Add `virtual` prop to `Combobox` component ([#2779](https://github.com/tailwindlabs/headlessui/pull/2779))

## [1.7.16] - 2023-08-17

### Fixed

- Fix form elements for uncontrolled `<Listbox multiple>` and `<Combobox multiple>` ([#2626](https://github.com/tailwindlabs/headlessui/pull/2626))
- Use correct value when resetting `<Listbox multiple>` and `<Combobox multiple>` ([#2626](https://github.com/tailwindlabs/headlessui/pull/2626))
- Render `<MainTreeNode />` in `PopoverGroup` component only ([#2634](https://github.com/tailwindlabs/headlessui/pull/2634))
- Disable smooth scrolling when opening/closing `Dialog` components on iOS ([#2635](https://github.com/tailwindlabs/headlessui/pull/2635))
- Don't assume `<Tab />` components are available when setting the next index ([#2642](https://github.com/tailwindlabs/headlessui/pull/2642))
- Improve SSR of the `Disclosure` component ([#2645](https://github.com/tailwindlabs/headlessui/pull/2645))
- Fix incorrectly focused `ComboboxInput` component on page load ([#2654](https://github.com/tailwindlabs/headlessui/pull/2654))
- Improve resetting values when using the `nullable` prop on the `Combobox` component ([#2660](https://github.com/tailwindlabs/headlessui/pull/2660))
- Prevent scrolling when focusing a tab ([#2674](https://github.com/tailwindlabs/headlessui/pull/2674))

## [1.7.15] - 2023-07-27

### Fixed

- Ensure the caret is in a consistent position when syncing the `Combobox.Input` value ([#2568](https://github.com/tailwindlabs/headlessui/pull/2568))
- Improve "outside click" behaviour in combination with 3rd party libraries ([#2572](https://github.com/tailwindlabs/headlessui/pull/2572))
- Improve performance of `Combobox` component ([#2574](https://github.com/tailwindlabs/headlessui/pull/2574))
- Ensure IME works on Android devices ([#2580](https://github.com/tailwindlabs/headlessui/pull/2580))
- Calculate `aria-expanded` purely based on the open/closed state ([#2610](https://github.com/tailwindlabs/headlessui/pull/2610))
- Submit form on `Enter` even if no submit-like button was found ([#2613](https://github.com/tailwindlabs/headlessui/pull/2613))

## [1.7.14] - 2023-06-01

### Fixed

- Fix memory leak in `Popover` component ([#2430](https://github.com/tailwindlabs/headlessui/pull/2430))
- Ensure `FocusTrap` is only active when the given `enabled` value is `true` ([#2456](https://github.com/tailwindlabs/headlessui/pull/2456))
- Ensure the exposed `activeIndex` is up to date for the `Combobox` component ([#2463](https://github.com/tailwindlabs/headlessui/pull/2463))
- Improve control over `Menu` and `Listbox` options while searching ([#2471](https://github.com/tailwindlabs/headlessui/pull/2471))
- Consider clicks inside iframes to be "outside" ([#2485](https://github.com/tailwindlabs/headlessui/pull/2485))
- Ensure moving focus within a `Portal` component, does not close the `Popover` component ([#2492](https://github.com/tailwindlabs/headlessui/pull/2492))

### Changed

- Move `types` condition to the front ([#2469](https://github.com/tailwindlabs/headlessui/pull/2469))

## [1.7.13] - 2023-04-12

### Fixed

- Fix focus styles showing up when using the mouse ([#2347](https://github.com/tailwindlabs/headlessui/pull/2347))
- Disable `ComboboxInput` when its `Combobox` is disabled ([#2375](https://github.com/tailwindlabs/headlessui/pull/2375))
- Add `FocusTrap` event listeners once document has loaded ([#2389](https://github.com/tailwindlabs/headlessui/pull/2389))
- Don't scroll-lock `<Dialog>` when wrapping transition isn't showing ([#2422](https://github.com/tailwindlabs/headlessui/pull/2422))
- Ensure DOM `ref` is properly handled in the `RadioGroup` component ([#2424](https://github.com/tailwindlabs/headlessui/pull/2424))
- Correctly handle IME composition in `<Combobox.Input>` ([#2426](https://github.com/tailwindlabs/headlessui/pull/2426))

### Added

- Add `form` prop to form-like components such as `RadioGroup`, `Switch`, `Listbox`, and `Combobox` ([#2356](https://github.com/tailwindlabs/headlessui/pull/2356))

## [1.7.12] - 2023-03-03

### Fixed

- Enable native label behavior for `<Switch>` where possible ([#2265](https://github.com/tailwindlabs/headlessui/pull/2265))
- Allow root containers from the `Dialog` component in the `FocusTrap` component ([#2322](https://github.com/tailwindlabs/headlessui/pull/2322))
- Cleanup internal TypeScript types ([#2329](https://github.com/tailwindlabs/headlessui/pull/2329))
- Fix restore focus to buttons in Safari, when `Dialog` component closes ([#2326](https://github.com/tailwindlabs/headlessui/pull/2326))
- Ensure hooks in the `FocusTrap` component only apply when mounted ([#2331](https://github.com/tailwindlabs/headlessui/pull/2331))

## [1.7.11] - 2023-02-24

### Fixed

- Ensure the main tree and parent `Dialog` components are marked as `inert` ([#2290](https://github.com/tailwindlabs/headlessui/pull/2290))
- Fix nested `Popover` components not opening ([#2293](https://github.com/tailwindlabs/headlessui/pull/2293))
- Fix `change` event incorrectly getting called on `blur` ([#2296](https://github.com/tailwindlabs/headlessui/pull/2296))
- Fix `Dialog` cleanup when the `Dialog` becomes hidden ([#2303](https://github.com/tailwindlabs/headlessui/pull/2303))

## [1.7.10] - 2023-02-15

### Fixed

- Don’t fire `afterLeave` event more than once for a given transition ([#2267](https://github.com/tailwindlabs/headlessui/pull/2267))
- Move `aria-multiselectable` to `[role=listbox]` in the `Combobox` component ([#2271](https://github.com/tailwindlabs/headlessui/pull/2271))
- Re-focus `Combobox.Input` when a `Combobox.Option` is selected ([#2272](https://github.com/tailwindlabs/headlessui/pull/2272))
- Ensure we reset the `activeOptionIndex` if the active option is unmounted ([#2274](https://github.com/tailwindlabs/headlessui/pull/2274))
- Start cleanup phase of the `Dialog` component when going into the `Closing` state ([#2264](https://github.com/tailwindlabs/headlessui/pull/2264))

## [1.7.9] - 2023-02-03

### Fixed

- Don't break overflow when multiple dialogs are open at the same time ([#2215](https://github.com/tailwindlabs/headlessui/pull/2215))

## [1.7.8] - 2023-01-27

### Changed

- Adjust SSR detection mechanism ([#2102](https://github.com/tailwindlabs/headlessui/pull/2102))

### Fixed

- Ensure `disabled="false"` is not incorrectly passed to the underlying DOM Node ([#2138](https://github.com/tailwindlabs/headlessui/pull/2138))
- Fix arrow key handling in `Tab` (after DOM order changes) ([#2145](https://github.com/tailwindlabs/headlessui/pull/2145))
- Fix `Tab` key with non focusable elements in `Popover.Panel` ([#2147](https://github.com/tailwindlabs/headlessui/pull/2147))
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
- Ensure Popover doesn't crash when `focus` is going to `window` ([#2019](https://github.com/tailwindlabs/headlessui/pull/2019))
- Ensure `shift+home` and `shift+end` works as expected in the `ComboboxInput` component ([#2024](https://github.com/tailwindlabs/headlessui/pull/2024))
- Improve syncing of the `ComboboxInput` value ([#2042](https://github.com/tailwindlabs/headlessui/pull/2042))
- Fix crash when using `multiple` mode without `value` prop (uncontrolled) for `Listbox` and `Combobox` components ([#2058](https://github.com/tailwindlabs/headlessui/pull/2058))
- Allow passing in your own `id` prop ([#2060](https://github.com/tailwindlabs/headlessui/pull/2060))
- Add `null` as a valid type for Listbox and Combobox in Vue ([#2064](https://github.com/tailwindlabs/headlessui/pull/2064), [#2067](https://github.com/tailwindlabs/headlessui/pull/2067))
- Improve SSR for Tabs in Vue ([#2068](https://github.com/tailwindlabs/headlessui/pull/2068))
- Ignore pointer events in Listbox, Menu, and Combobox when cursor hasn't moved ([#2069](https://github.com/tailwindlabs/headlessui/pull/2069))
- Allow clicks inside dialog panel when target is inside shadow root ([#2079](https://github.com/tailwindlabs/headlessui/pull/2079))

## [1.7.4] - 2022-11-03

### Fixed

- Expose `close` function for `Menu` and `MenuItem` components ([#1897](https://github.com/tailwindlabs/headlessui/pull/1897))
- Fix `useOutsideClick`, add improvements for ShadowDOM ([#1914](https://github.com/tailwindlabs/headlessui/pull/1914))
- Prevent default slot warning when using a component for `as` prop ([#1915](https://github.com/tailwindlabs/headlessui/pull/1915))
- Fire `<ComboboxInput>`'s `@change` handler when changing the value internally ([#1916](https://github.com/tailwindlabs/headlessui/pull/1916))

## [1.7.3] - 2022-09-30

### Fixed

- Call `displayValue` with a v-model of `ref(undefined)` on `ComboboxInput` ([#1865](https://github.com/tailwindlabs/headlessui/pull/1865))
- Improve `Portal` detection for `Popover` components ([#1842](https://github.com/tailwindlabs/headlessui/pull/1842))
- Fix crash when `children` are `undefined` ([#1885](https://github.com/tailwindlabs/headlessui/pull/1885))
- Fix `useOutsideClick` swallowing events inside ShadowDOM ([#1876](https://github.com/tailwindlabs/headlessui/pull/1876))
- Fix `Tab` incorrectly activating on `focus` event ([#1887](https://github.com/tailwindlabs/headlessui/pull/1887))

## [1.7.2] - 2022-09-15

### Fixed

- Prevent option selection in `ComboboxInput` while composing ([#1850](https://github.com/tailwindlabs/headlessui/issues/1850))
- Ensure we handle the `static` prop in `TabPanel` components correctly ([#1856](https://github.com/tailwindlabs/headlessui/pull/1856))

## [1.7.1] - 2022-09-12

### Fixed

- Improve iOS scroll locking ([#1830](https://github.com/tailwindlabs/headlessui/pull/1830))
- Ensure `Tab` order stays consistent, and the currently active `Tab` stays active ([#1837](https://github.com/tailwindlabs/headlessui/pull/1837))

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
- Improve outside click on Safari iOS ([#1712](https://github.com/tailwindlabs/headlessui/pull/1712))
- Improve event handler merging ([#1715](https://github.com/tailwindlabs/headlessui/pull/1715))
- Fix incorrect scrolling to the bottom when opening a `Dialog` ([#1716](https://github.com/tailwindlabs/headlessui/pull/1716))
- Don't overwrite `element.focus()` on `<PopoverPanel>` ([#1719](https://github.com/tailwindlabs/headlessui/pull/1719))
- Improve `Combobox` re-opening keyboard issue on mobile ([#1732](https://github.com/tailwindlabs/headlessui/pull/1732))
- Only select the active option when using "singular" mode when pressing `<tab>` in the `Combobox` component ([#1750](https://github.com/tailwindlabs/headlessui/pull/1750))
- Only restore focus to the `MenuButton` if necessary when activating a `MenuOption` ([#1782](https://github.com/tailwindlabs/headlessui/pull/1782))
- Don't scroll when wrapping around in focus trap ([#1789](https://github.com/tailwindlabs/headlessui/pull/1789))
- Improve accessibility when announcing `ListboxOption` and `ComboboxOption` components ([#1812](https://github.com/tailwindlabs/headlessui/pull/1812))
- Expose the `value` from the `Combobox` and `Listbox` components slot ([#1822](https://github.com/tailwindlabs/headlessui/pull/1822))
- Improve `scroll lock` on iOS ([#1824](https://github.com/tailwindlabs/headlessui/pull/1824))

## [1.6.7] - 2022-07-12

### Fixed

- Prevent cancelling transitions due to focus trap ([#1664](https://github.com/tailwindlabs/headlessui/pull/1664))

## [1.6.6] - 2022-07-07

### Fixed

- Fix getting Vue dom elements ([#1610](https://github.com/tailwindlabs/headlessui/pull/1610))
- Ensure `CMD`+`Backspace` works in nullable mode for `Combobox` component ([#1617](https://github.com/tailwindlabs/headlessui/pull/1617))
- Properly merge incoming props with own props ([#1651](https://github.com/tailwindlabs/headlessui/pull/1651))
- Ensure `PopoverPanel` can be used inside `<transition>` ([#1653](https://github.com/tailwindlabs/headlessui/pull/1653))

## [1.6.5] - 2022-06-20

### Fixed

- Support `<slot>` children when using `as="template"` ([#1548](https://github.com/tailwindlabs/headlessui/pull/1548))
- Improve outside click of `Dialog` component ([#1546](https://github.com/tailwindlabs/headlessui/pull/1546))
- Detect outside clicks from within `<iframe>` elements ([#1552](https://github.com/tailwindlabs/headlessui/pull/1552))
- Only render the `Dialog` on the client ([#1566](https://github.com/tailwindlabs/headlessui/pull/1566))
- Improve Combobox input cursor position ([#1574](https://github.com/tailwindlabs/headlessui/pull/1574))
- Fix scrolling issue in `Tab` component when using arrow keys ([#1584](https://github.com/tailwindlabs/headlessui/pull/1584))
- Fix missing `aria-expanded` for `ComboboxInput` component ([#1605](https://github.com/tailwindlabs/headlessui/pull/1605))

## [1.6.4] - 2022-05-29

### Fixed

- Ensure `Escape` propagates correctly in `Combobox` component ([#1511](https://github.com/tailwindlabs/headlessui/pull/1511))
- Remove leftover code in Combobox component ([#1514](https://github.com/tailwindlabs/headlessui/pull/1514))

## [1.6.3] - 2022-05-25

### Fixed

- Allow to override the `type` on the `ComboboxInput` ([#1476](https://github.com/tailwindlabs/headlessui/pull/1476))
- Ensure the the `<PopoverPanel focus>` closes correctly ([#1477](https://github.com/tailwindlabs/headlessui/pull/1477))
- Only render the `FocusSentinel` if required in the `Tabs` component ([#1493](https://github.com/tailwindlabs/headlessui/pull/1493))

## [1.6.2] - 2022-05-19

### Fixed

- Ensure `DialogPanel` exposes its ref ([#1404](https://github.com/tailwindlabs/headlessui/pull/1404))
- Ignore `Escape` when event got prevented in `Dialog` component ([#1424](https://github.com/tailwindlabs/headlessui/pull/1424))
- Improve `FocusTrap` behaviour ([#1432](https://github.com/tailwindlabs/headlessui/pull/1432))
- Simplify `Popover` Tab logic by using sentinel nodes instead of keydown event interception ([#1440](https://github.com/tailwindlabs/headlessui/pull/1440))
- Ensure the `PopoverPanel` is clickable without closing the `Popover` ([#1443](https://github.com/tailwindlabs/headlessui/pull/1443))
- Improve "Scroll lock" scrollbar width for `Dialog` component ([#1457](https://github.com/tailwindlabs/headlessui/pull/1457))
- Don't throw when SSR rendering internal portals in Vue ([#1459](https://github.com/tailwindlabs/headlessui/pull/1459))

## [1.6.1] - 2022-05-03

### Fixed

- Manually passthrough `attrs` for `Combobox`, `Listbox` and `TabsGroup` component ([#1372](https://github.com/tailwindlabs/headlessui/pull/1372))
- Fix enter transitions in Vue ([#1395](https://github.com/tailwindlabs/headlessui/pull/1395))

## [1.6.0] - 2022-04-25

### Fixed

- Make sure that the input syncs when the combobox closes ([#1137](https://github.com/tailwindlabs/headlessui/pull/1137))
- Ensure that you can close the `Combobox` initially ([#1148](https://github.com/tailwindlabs/headlessui/pull/1148))
- Fix `Dialog` usage in `Tab` component ([#1149](https://github.com/tailwindlabs/headlessui/pull/1149))
- Ensure links are triggered inside `PopoverPanel` components ([#1153](https://github.com/tailwindlabs/headlessui/pull/1153))
- Fix `hover` scroll issue in `Listbox`, `Combobox` and `Menu` components ([#1161](https://github.com/tailwindlabs/headlessui/pull/1161))
- Guarantee DOM sort order when performing `Listbox`, `Combobox` and `Menu` actions ([#1168](https://github.com/tailwindlabs/headlessui/pull/1168))
- Improve outside click support ([#1175](https://github.com/tailwindlabs/headlessui/pull/1175))
- Reset `ComboboxInput` when the value gets reset ([#1181](https://github.com/tailwindlabs/headlessui/pull/1181))
- Adjust active `item`/`option` index on `Listbox`, `Combobox` and `Menu` components ([#1184](https://github.com/tailwindlabs/headlessui/pull/1184))
- Fix re-focusing element after close ([#1186](https://github.com/tailwindlabs/headlessui/pull/1186))
- Fix `Dialog` cycling ([#553](https://github.com/tailwindlabs/headlessui/pull/553))
- Only activate the `Tab` on mouseup ([#1192](https://github.com/tailwindlabs/headlessui/pull/1192))
- Ignore "outside click" on removed elements ([#1193](https://github.com/tailwindlabs/headlessui/pull/1193))
- Remove `focus()` from `Listbox.Option` ([#1218](https://github.com/tailwindlabs/headlessui/pull/1218))
- Improve some internal code ([#1221](https://github.com/tailwindlabs/headlessui/pull/1221))
- Don't drop initial character when searching in Combobox ([#1223](https://github.com/tailwindlabs/headlessui/pull/1223))
- Use `ownerDocument` instead of `document` ([#1158](https://github.com/tailwindlabs/headlessui/pull/1158))
- Fix, re-expose `el` from each component ([#1230](https://github.com/tailwindlabs/headlessui/pull/1230))
- Ensure focus trapping plays well with the `Tab` and `Dialog` components ([#1231](https://github.com/tailwindlabs/headlessui/pull/1231))
- Improve syncing of `ComboboxInput` value ([#1248](https://github.com/tailwindlabs/headlessui/pull/1248))
- Fix tree-shaking support ([#1247](https://github.com/tailwindlabs/headlessui/pull/1247))
- Stop propagation on the `PopoverButton` ([#1263](https://github.com/tailwindlabs/headlessui/pull/1263))
- Fix incorrect closing while interacting with third party libraries in `Dialog` component ([#1268](https://github.com/tailwindlabs/headlessui/pull/1268))
- Mimic browser select on focus when navigating via `Tab` ([#1272](https://github.com/tailwindlabs/headlessui/pull/1272))
- Resolve `initialFocusRef` correctly ([#1276](https://github.com/tailwindlabs/headlessui/pull/1276))
- Ensure that there is always an active option in the `Combobox` ([#1279](https://github.com/tailwindlabs/headlessui/pull/1279), [#1281](https://github.com/tailwindlabs/headlessui/pull/1281))
- Support classic form submissions in `RadioGroup`, `Switch` and `Combobox` components ([#1285](https://github.com/tailwindlabs/headlessui/pull/1285))
- Fix `nullable` prop for Vue ([2b109548b1a94a30858cf58c8f525554a1c12cbb](https://github.com/tailwindlabs/headlessui/commit/2b109548b1a94a30858cf58c8f525554a1c12cbb))
- Prefer incoming `open` prop over OpenClosed state ([#1360](https://github.com/tailwindlabs/headlessui/pull/1360))

### Added

- Add classic form submission compatibility via new hidden inputs ([#1214](https://github.com/tailwindlabs/headlessui/pull/1214))
- Add multiple value support to `Listbox` and `Combobox` components ([#1243](https://github.com/tailwindlabs/headlessui/pull/1243), [#1355](https://github.com/tailwindlabs/headlessui/pull/1355))
- Add support for clearing the value of a `Combobox` ([#1295](https://github.com/tailwindlabs/headlessui/pull/1295))
- Add `DialogBackdrop` and `DialogPanel` components ([#1333](https://github.com/tailwindlabs/headlessui/pull/1333))

## [1.5.0] - 2022-02-17

### Fixed

- Ensure correct order when conditionally rendering `MenuItem`, `ListboxOption` and `RadioGroupOption` ([#1045](https://github.com/tailwindlabs/headlessui/pull/1045))
- Improve typeahead search logic ([#1051](https://github.com/tailwindlabs/headlessui/pull/1051))
- Improve overal codebase, use modern tech like `esbuild` and TypeScript 4! ([#1055](https://github.com/tailwindlabs/headlessui/pull/1055))
- Improve build files ([#1078](https://github.com/tailwindlabs/headlessui/pull/1078))
- Ensure typeahead stays on same item if it still matches ([#1098](https://github.com/tailwindlabs/headlessui/pull/1098))

### Added

- Add `Combobox` component ([#1047](https://github.com/tailwindlabs/headlessui/pull/1047), [#1099](https://github.com/tailwindlabs/headlessui/pull/1099), [#1101](https://github.com/tailwindlabs/headlessui/pull/1101), [#1104](https://github.com/tailwindlabs/headlessui/pull/1104), [#1106](https://github.com/tailwindlabs/headlessui/pull/1106), [#1109](https://github.com/tailwindlabs/headlessui/pull/1109))

## [1.4.3] - 2022-01-14

### Fixes

- Fix missing key binding in examples ([#1036](https://github.com/tailwindlabs/headlessui/pull/1036), [#1006](https://github.com/tailwindlabs/headlessui/pull/1006))
- Fix slice => splice typo in `Tabs` component ([#1037](https://github.com/tailwindlabs/headlessui/pull/1037), [#986](https://github.com/tailwindlabs/headlessui/pull/986))
- Ensure correct DOM node order when performing focus actions ([#1038](https://github.com/tailwindlabs/headlessui/pull/1038))

### Added

- Allow for `TabGroup` to be controllable ([#909](https://github.com/tailwindlabs/headlessui/pull/909), [#970](https://github.com/tailwindlabs/headlessui/pull/970))

## [1.4.2] - 2021-11-08

### Fixes

- Stop the event from propagating in the `Popover` component ([#798](https://github.com/tailwindlabs/headlessui/pull/798))
- Allow clicking on elements inside a `DialogOverlay` ([#816](https://github.com/tailwindlabs/headlessui/pull/816))
- Fix SSR crash because of `useWindowEvent` ([#817](https://github.com/tailwindlabs/headlessui/pull/817))
- Improve tree shaking ([#859](https://github.com/tailwindlabs/headlessui/pull/859))
- Add `type="button"` to `Tabs` component ([#912](https://github.com/tailwindlabs/headlessui/pull/912))

## [1.4.1] - 2021-08-30

### Fixes

- Only add `type=button` to real buttons ([#709](https://github.com/tailwindlabs/headlessui/pull/709))
- Add Vue emit types ([#679](https://github.com/tailwindlabs/headlessui/pull/679), [#712](https://github.com/tailwindlabs/headlessui/pull/712))
- Fix `escape` bug not closing Dialog after clicking in Dialog ([#754](https://github.com/tailwindlabs/headlessui/pull/754))
- Use `console.warn` instead of throwing an error when there are no focusable elements ([#775](https://github.com/tailwindlabs/headlessui/pull/775))

## [1.4.0] - 2021-07-29

### Added

- Add new `Tabs` component ([#674](https://github.com/tailwindlabs/headlessui/pull/674), [#698](https://github.com/tailwindlabs/headlessui/pull/698))
- Make `DisclosureButton` close the disclosure inside a `DisclosurePanel` ([#682](https://github.com/tailwindlabs/headlessui/pull/682))
- Add `aria-orientation` to `Listbox`, which swaps Up/Down with Left/Right keys ([#683](https://github.com/tailwindlabs/headlessui/pull/683))
- Expose `close` function from the scoped slot for `Disclosure`, `DisclosurePanel`, `Popover` and `PopoverPanel` ([#697](https://github.com/tailwindlabs/headlessui/pull/697))

## [1.3.0] - 2021-06-21

### Added

- Ensure that you can use `TransitionChild` when using implicit Transitions ([#503](https://github.com/tailwindlabs/headlessui/pull/503))
- Add new `entered` prop for `Transition` and `TransitionChild` components ([#504](https://github.com/tailwindlabs/headlessui/pull/504))

### Fixes

- Add `aria-disabled` on disabled `RadioGroup.Option` components ([#543](https://github.com/tailwindlabs/headlessui/pull/543))
- Improve `disabled` and `tabindex` prop handling ([#512](https://github.com/tailwindlabs/headlessui/pull/512))
- Improve reactivity when destructuring from props ([#512](https://github.com/tailwindlabs/headlessui/pull/512))
- Improve `aria-expanded` logic ([#592](https://github.com/tailwindlabs/headlessui/pull/592))

## [1.2.0] - 2021-05-10

### Added

- Introduce Open/Closed state, to simplify component communication ([#466](https://github.com/tailwindlabs/headlessui/pull/466))

## [1.1.1] - 2021-04-28

### Fixes

- Fix form submission within Dialog ([#460](https://github.com/tailwindlabs/headlessui/pull/460))
- Fix TypeScript types for `Listbox` and `Switch` ([#459](https://github.com/tailwindlabs/headlessui/pull/459), [#461](https://github.com/tailwindlabs/headlessui/pull/461))

### Added

- Add `disabled` prop to `RadioGroup` and `RadioGroup.Option` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Add `defaultOpen` prop to the `Disclosure` component ([#447](https://github.com/tailwindlabs/headlessui/pull/447))

## [1.1.0] - 2021-04-26

### Fixes

- Improve search, make searching case insensitive ([#385](https://github.com/tailwindlabs/headlessui/pull/385))
- Fix unreachable `RadioGroup` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Fix `RadioGroupOption` value type ([#400](https://github.com/tailwindlabs/headlessui/pull/400))
- Fix closing nested `Dialog` components when pressing `Escape` ([#430](https://github.com/tailwindlabs/headlessui/pull/430))

### Added

- Add `disabled` prop to `RadioGroup` and `RadioGroupOption` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Add `defaultOpen` prop to the `Disclosure` component ([#447](https://github.com/tailwindlabs/headlessui/pull/447))

## [1.0.0] - 2021-04-14

### Fixes

- Fix incorrect `DOM` node from ref ([#249](https://github.com/tailwindlabs/headlessui/pull/249))
- Stop propagating keyboard/mouse events ([#282](https://github.com/tailwindlabs/headlessui/pull/282))

### Added

- Add `SwitchDescription` component, which adds the `aria-describedby` to the actual Switch ([#220](https://github.com/tailwindlabs/headlessui/pull/220))
- Add `Disclosure`, `DisclosureButton`, `DisclosurePanel` components ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `Dialog`, `DialogOverlay`, `DialogTitle` and `DialogDescription` components ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `Portal` and `PortalGroup` components ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `FocusTrap` component ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `Popover`, `PopoverButton`, `PopoverOverlay`, `PopoverPanel` and `PopoverGroup` components ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `RadioGroup`, `RadioGroupOption`, `RadioGroupLabel` and `RadioGroupDescription` components ([#282](https://github.com/tailwindlabs/headlessui/pull/282))
- Add `TransitionRoot` and `TransitionChild` components ([#326](https://github.com/tailwindlabs/headlessui/pull/326))

## [0.3.1] - 2021-04-02

### Fixes

- Fix broken behaviour since Vue 3.0.5 ([#279](https://github.com/tailwindlabs/headlessui/pull/279))

## [0.3.0] - 2021-02-06

### Fixes

- Ensure that you can't use Enter to invoke the Switch
- Fix outside click refocus bug ([#114](https://github.com/tailwindlabs/headlessui/pull/114))
- Prevent scrolling when refocusing items
- Ensure `Switch` has `type="button"` ([#192](https://github.com/tailwindlabs/headlessui/pull/192))
- Added `emits` property to Vue components ([#199](https://github.com/tailwindlabs/headlessui/pull/199))
- Fix `disabled` not working when inside a disabled fieldset ([#202](https://github.com/tailwindlabs/headlessui/pull/202))
- Trigger "outside click" behaviour on mousedown ([#212](https://github.com/tailwindlabs/headlessui/pull/212))
- Ensure the `active` MenuItem is scrolled into view
- Ensure valid Menu accessibility tree ([#228](https://github.com/tailwindlabs/headlessui/pull/228))

### Added

- Add render features + render strategy (`static` and `unmount={true | false}`) ([#106](https://github.com/tailwindlabs/headlessui/pull/106))
- Add `disabled` prop to `Listbox` itself, instead of the `ListboxButton` ([#229](https://github.com/tailwindlabs/headlessui/pull/229))

## [0.2.0] - 2020-10-06

### Added

- Add `Listbox` component
- Add `Switch` component

## [0.1.3] - 2020-09-29

### Fixes

- Fix an issue where you couldn't click on menu items that were links.
- Fix outside click behaviour. If you had multiple menu's, when menu 1 is open, menu 2 is closed and you click on menu button 2 it will open both menu's. This is now fixed.
- Ensure when using keyboard navigation we prevent the default behaviour.

## [0.1.2] - 2020-09-25

### Fixes

- Fix issue where button `MenuItem` instances didn't properly fire click events
- Don't pass `disabled` prop through to children, only add `aria-disabled`

## [0.1.1] - 2020-09-24

### Added

- Everything!

[unreleased]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.16...HEAD
[1.7.16]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.15...v1.7.16
[1.7.15]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.14...@headlessui/vue@v1.7.15
[1.7.14]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.13...@headlessui/vue@v1.7.14
[1.7.13]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.12...@headlessui/vue@v1.7.13
[1.7.12]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.11...@headlessui/vue@v1.7.12
[1.7.11]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.10...@headlessui/vue@v1.7.11
[1.7.10]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.9...@headlessui/vue@v1.7.10
[1.7.9]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.8...@headlessui/vue@v1.7.9
[1.7.8]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.7...@headlessui/vue@v1.7.8
[1.7.7]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.6...@headlessui/vue@v1.7.7
[1.7.6]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.5...@headlessui/vue@v1.7.6
[1.7.5]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.4...@headlessui/vue@v1.7.5
[1.7.4]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.3...@headlessui/vue@v1.7.4
[1.7.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.2...@headlessui/vue@v1.7.3
[1.7.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.1...@headlessui/vue@v1.7.2
[1.7.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.7.0...@headlessui/vue@v1.7.1
[1.7.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.7...@headlessui/vue@v1.7.0
[1.6.7]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.6...@headlessui/vue@v1.6.7
[1.6.6]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.5...@headlessui/vue@v1.6.6
[1.6.5]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.4...@headlessui/vue@v1.6.5
[1.6.4]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.3...@headlessui/vue@v1.6.4
[1.6.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.2...@headlessui/vue@v1.6.3
[1.6.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.1...@headlessui/vue@v1.6.2
[1.6.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.0...@headlessui/vue@v1.6.1
[1.6.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.5.0...@headlessui/vue@v1.6.0
[1.5.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.3...@headlessui/vue@v1.5.0
[1.4.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.2...@headlessui/vue@v1.4.3
[1.4.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.1...@headlessui/vue@v1.4.2
[1.4.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.0...@headlessui/vue@v1.4.1
[1.4.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.3.0...@headlessui/vue@v1.4.0
[1.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.2.0...@headlessui/vue@v1.3.0
[1.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.1.1...@headlessui/vue@v1.2.0
[1.1.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.1.0...@headlessui/vue@v1.1.1
[1.1.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.0.0...@headlessui/vue@v1.1.0
[1.0.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.3.1...@headlessui/vue@v1.0.0
[0.3.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.3.0...@headlessui/vue@v0.3.1
[0.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.2.0...@headlessui/vue@v0.3.0
[0.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.3...@headlessui/vue@v0.2.0
[0.1.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.2...@headlessui/vue@v0.1.3
[0.1.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.1...@headlessui/vue@v0.1.2
[0.1.1]: https://github.com/tailwindlabs/headlessui/releases/tag/@headlessui/vue@v0.1.1
