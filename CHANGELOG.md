# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased - React]

### Fixes

- Stop the event from propagating in the `Popover` component ([#798](https://github.com/tailwindlabs/headlessui/pull/798))
- Allow to click on elements inside a `Dialog.Overlay` ([#816](https://github.com/tailwindlabs/headlessui/pull/816))

## [Unreleased - Vue]

### Fixes

- Stop the event from propagating in the `Popover` component ([#798](https://github.com/tailwindlabs/headlessui/pull/798))
- Allow to click on elements inside a `DialogOverlay` ([#816](https://github.com/tailwindlabs/headlessui/pull/816))

## [@headlessui/react@v1.4.1] - 2021-08-30

### Fixes

- Only add `type=button` to real buttons ([#709](https://github.com/tailwindlabs/headlessui/pull/709))
- Fix `escape` bug not closing Dialog after clicking in Dialog ([#754](https://github.com/tailwindlabs/headlessui/pull/754))
- Use `console.warn` instead of throwing an error when there are no focusable elements ([#775](https://github.com/tailwindlabs/headlessui/pull/775))

## [@headlessui/vue@v1.4.1] - 2021-08-30

### Fixes

- Only add `type=button` to real buttons ([#709](https://github.com/tailwindlabs/headlessui/pull/709))
- Add Vue emit types ([#679](https://github.com/tailwindlabs/headlessui/pull/679), [#712](https://github.com/tailwindlabs/headlessui/pull/712))
- Fix `escape` bug not closing Dialog after clicking in Dialog ([#754](https://github.com/tailwindlabs/headlessui/pull/754))
- Use `console.warn` instead of throwing an error when there are no focusable elements ([#775](https://github.com/tailwindlabs/headlessui/pull/775))

## [@headlessui/react@v1.4.0] - 2021-07-29

### Added

- Add new `Tabs` component ([#674](https://github.com/tailwindlabs/headlessui/pull/674), [#698](https://github.com/tailwindlabs/headlessui/pull/698))
- Make `Disclosure.Button` close the disclosure inside a `Disclosure.Panel` ([#682](https://github.com/tailwindlabs/headlessui/pull/682))
- Add `aria-orientation` to `Listbox`, which swaps Up/Down with Left/Right keys ([#683](https://github.com/tailwindlabs/headlessui/pull/683))
- Expose `close` function from the render prop for `Disclosure`, `Disclosure.Panel`, `Popover` and `Popover.Panel` ([#697](https://github.com/tailwindlabs/headlessui/pull/697))


## [@headlessui/vue@v1.4.0] - 2021-07-29

### Added

- Add new `Tabs` component ([#674](https://github.com/tailwindlabs/headlessui/pull/674), [#698](https://github.com/tailwindlabs/headlessui/pull/698))
- Make `DisclosureButton` close the disclosure inside a `DisclosurePanel` ([#682](https://github.com/tailwindlabs/headlessui/pull/682))
- Add `aria-orientation` to `Listbox`, which swaps Up/Down with Left/Right keys ([#683](https://github.com/tailwindlabs/headlessui/pull/683))
- Expose `close` function from the scoped slot for `Disclosure`, `DisclosurePanel`, `Popover` and `PopoverPanel` ([#697](https://github.com/tailwindlabs/headlessui/pull/697))

## [@headlessui/react@v1.3.0] - 2021-06-21

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

## [@headlessui/vue@v1.3.0] - 2021-06-21

### Added 

- Ensure that you can use `TransitionChild` when using implicit Transitions ([#503](https://github.com/tailwindlabs/headlessui/pull/503))
- Add new `entered` prop for `Transition` and `TransitionChild` components ([#504](https://github.com/tailwindlabs/headlessui/pull/504))

### Fixes

- Add `aria-disabled` on disabled `RadioGroup.Option` components ([#543](https://github.com/tailwindlabs/headlessui/pull/543))
- Improve `disabled` and `tabindex` prop handling ([#512](https://github.com/tailwindlabs/headlessui/pull/512))
- Improve reactivity when destructuring from props ([#512](https://github.com/tailwindlabs/headlessui/pull/512))
- Improve `aria-expanded` logic ([#592](https://github.com/tailwindlabs/headlessui/pull/592))

## [@headlessui/react@v1.2.0] - 2021-05-10

### Added 

- Introduce Open/Closed state, to simplify component communication ([#466](https://github.com/tailwindlabs/headlessui/pull/466))

### Fixes

- Improve SSR for `Dialog` ([#477](https://github.com/tailwindlabs/headlessui/pull/477))
- Delay focus trap initialization ([#477](https://github.com/tailwindlabs/headlessui/pull/477))
- Improve incorrect behaviour for nesting `Dialog` components ([#560](https://github.com/tailwindlabs/headlessui/pull/560))

## [@headlessui/vue@v1.2.0] - 2021-05-10

### Added 

- Introduce Open/Closed state, to simplify component communication ([#466](https://github.com/tailwindlabs/headlessui/pull/466))

## [@headlessui/react@v1.1.1] - 2021-04-28

### Fixes

- Fix form submission within Dialog ([#460](https://github.com/tailwindlabs/headlessui/pull/460))

## [@headlessui/vue@v1.1.1] - 2021-04-28

### Fixes

- Fix form submission within Dialog ([#460](https://github.com/tailwindlabs/headlessui/pull/460))
- Fix TypeScript types for `Listbox` and `Switch` ([#459](https://github.com/tailwindlabs/headlessui/pull/459), [#461](https://github.com/tailwindlabs/headlessui/pull/461))

## [@headlessui/react@v1.1.0] - 2021-04-26

### Fixes

- Improve search, make searching case insensitive ([#385](https://github.com/tailwindlabs/headlessui/pull/385))
- Fix unreachable `RadioGroup` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Fix closing nested `Dialog` components when pressing `Escape` ([#430](https://github.com/tailwindlabs/headlessui/pull/430))

### Added

- Add `disabled` prop to `RadioGroup` and `RadioGroup.Option` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Add `defaultOpen` prop to the `Disclosure` component ([#447](https://github.com/tailwindlabs/headlessui/pull/447))

## [@headlessui/vue@v1.1.0] - 2021-04-26

### Fixes

- Improve search, make searching case insensitive ([#385](https://github.com/tailwindlabs/headlessui/pull/385))
- Fix unreachable `RadioGroup` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Fix `RadioGroupOption` value type ([#400](https://github.com/tailwindlabs/headlessui/pull/400))
- Fix closing nested `Dialog` components when pressing `Escape` ([#430](https://github.com/tailwindlabs/headlessui/pull/430))

### Added

- Add `disabled` prop to `RadioGroup` and `RadioGroupOption` ([#401](https://github.com/tailwindlabs/headlessui/pull/401))
- Add `defaultOpen` prop to the `Disclosure` component ([#447](https://github.com/tailwindlabs/headlessui/pull/447))

## [@headlessui/react@v1.0.0] - 2021-04-14

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

## [@headlessui/vue@v1.0.0] - 2021-04-14

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

## [@headlessui/react@v0.3.2] - 2021-04-02

### Fixes

- Fix incorrect type error `unique symbol` ([#248](https://github.com/tailwindlabs/headlessui/pull/248), [#240](https://github.com/tailwindlabs/headlessui/issues/240))

## [@headlessui/vue@v0.3.1] - 2021-04-02

### Fixes

- Fix broken behaviour since Vue 3.0.5 ([#279](https://github.com/tailwindlabs/headlessui/pull/279))

## [@headlessui/react@v0.3.1] - 2021-02-11

### Fixes

- Fix incorrect `types` path ([d557d50](https://github.com/tailwindlabs/headlessui/commit/d557d5013968f7bb9877f190b682318704043905))
- Fix TypeScript render related types ([bb68793](https://github.com/tailwindlabs/headlessui/commit/bb68793f08a57833095a38519b639a744076dc69))

## [@headlessui/react@v0.3.0] - 2021-02-06

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

## [@headlessui/vue@v0.3.0] - 2021-02-06

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

## [@headlessui/react@v0.2.0] - 2020-10-06

- Add `Listbox` component
- Add `Switch` component

## [@headlessui/vue@v0.2.0] - 2020-10-06

- Add `Listbox` component
- Add `Switch` component

## [@headlessui/react@v0.1.3] - 2020-09-29

- Fix outside click behaviour. If you had multiple menu's, when menu 1 is open, menu 2 is closed and you click on menu button 2 it will open both menu's. This is now fixed.
- Ensure when using keyboard navigation we prevent the default behaviour.

## [@headlessui/vue@v0.1.3] - 2020-09-29

- Fix an issue where you couldn't click on menu items that were links.
- Fix outside click behaviour. If you had multiple menu's, when menu 1 is open, menu 2 is closed and you click on menu button 2 it will open both menu's. This is now fixed.
- Ensure when using keyboard navigation we prevent the default behaviour.

## [@headlessui/react@v0.1.2] - 2020-09-25

- Add tests for `onClick` handling that wasn't working properly in @headlessui/vue to ensure behavior stays the same in this library
- Don't pass `disabled` prop through to children, only add `aria-disabled`

## [@headlessui/vue@v0.1.2] - 2020-09-25

- Fix issue where button `MenuItem` instances didn't properly fire click events
- Don't pass `disabled` prop through to children, only add `aria-disabled`

## [@headlessui/react@v0.1.1] - 2020-09-24

- Initial release

## [@headlessui/vue@v0.1.1] - 2020-09-24

- Initial release

[unreleased - react]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.1...HEAD
[unreleased - vue]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.1...HEAD
[@headlessui/react@v1.4.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.4.0...@headlessui/react@v1.4.1
[@headlessui/vue@v1.4.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.4.0...@headlessui/vue@v1.4.1
[@headlessui/react@v1.4.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.3.0...@headlessui/react@v1.4.0
[@headlessui/vue@v1.4.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.3.0...@headlessui/vue@v1.4.0
[@headlessui/react@v1.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.2.0...@headlessui/react@v1.3.0
[@headlessui/vue@v1.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.2.0...@headlessui/vue@v1.3.0
[@headlessui/react@v1.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.1.1...@headlessui/react@v1.2.0
[@headlessui/vue@v1.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.1.1...@headlessui/vue@v1.2.0
[@headlessui/react@v1.1.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.1.0...@headlessui/react@v1.1.1
[@headlessui/vue@v1.1.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.1.0...@headlessui/vue@v1.1.1
[@headlessui/react@v1.1.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v1.0.0...@headlessui/react@v1.1.0
[@headlessui/vue@v1.1.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v1.0.0...@headlessui/vue@v1.1.0
[@headlessui/react@v1.0.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.2...@headlessui/react@v1.0.0
[@headlessui/vue@v1.0.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.3.1...@headlessui/vue@v1.0.0
[@headlessui/react@v0.3.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.1...@headlessui/react@v0.3.2
[@headlessui/vue@v0.3.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.3.0...@headlessui/vue@v0.3.1
[@headlessui/react@v0.3.1]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.0...@headlessui/react@v0.3.1
[@headlessui/react@v0.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.2.0...@headlessui/react@v0.3.0
[@headlessui/vue@v0.3.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.2.0...@headlessui/vue@v0.3.0
[@headlessui/react@v0.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.3...@headlessui/react@v0.2.0
[@headlessui/vue@v0.2.0]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.3...@headlessui/vue@v0.2.0
[@headlessui/react@v0.1.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.2...@headlessui/react@v0.1.3
[@headlessui/vue@v0.1.3]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.2...@headlessui/vue@v0.1.3
[@headlessui/react@v0.1.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.1.1...@headlessui/react@v0.1.2
[@headlessui/vue@v0.1.2]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.1.1...@headlessui/vue@v0.1.2
[@headlessui/react@v0.1.1]: https://github.com/tailwindlabs/headlessui/releases/tag/@headlessui/react@v0.1.1
[@headlessui/vue@v0.1.1]: https://github.com/tailwindlabs/headlessui/releases/tag/@headlessui/vue@v0.1.1
