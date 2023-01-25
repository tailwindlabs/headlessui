// This was taken from the ESM / CJS compatible version found in Remix Router:
// https://github.com/remix-run/react-router/tree/43cc1aacd8b132507618a4a1dd7de3674cd7bcf4/packages/react-router/lib/use-sync-external-store-shim

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react'
import { useSyncExternalStore as client } from './useSyncExternalStoreShimClient'
import { useSyncExternalStore as server } from './useSyncExternalStoreShimServer'

const canUseDOM: boolean = !!(
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
)

const isServerEnvironment = !canUseDOM
const shim = isServerEnvironment ? server : client

type UseSyncExternalStoreFn = <T>(
  subscribe: (fn: () => void) => () => void,
  getSnapshot: () => T,
  // Note: The shim does not use getServerSnapshot, because pre-18 versions of
  // React do not expose a way to check if we're hydrating. So users of the shim
  // will need to track that themselves and return the correct value
  // from `getSnapshot`.
  getServerSnapshot?: () => T
) => T

// @ts-ignore
export const useSyncExternalStore: UseSyncExternalStoreFn =
  'useSyncExternalStore' in React ? ((r) => r.useSyncExternalStore)(React) : shim
