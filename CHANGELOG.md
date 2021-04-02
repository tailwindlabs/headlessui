# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased - React]

- Nothing yet!

## [Unreleased - Vue]

- Nothing yet!

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

[unreleased - react]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/react@v0.3.2...HEAD
[unreleased - vue]: https://github.com/tailwindlabs/headlessui/compare/@headlessui/vue@v0.3.1...HEAD
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
