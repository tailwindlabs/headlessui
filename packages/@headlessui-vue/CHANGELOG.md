# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add `by` prop for `Listbox`, `Combobox` and `RadioGroup` ([#1482](https://github.com/tailwindlabs/headlessui/pull/1482))
- Add `@headlessui/tailwindcss` plugin ([#1487](https://github.com/tailwindlabs/headlessui/pull/1487))

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

[unreleased]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.6.3...HEAD
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
