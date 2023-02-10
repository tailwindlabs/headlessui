// This file contains functions to detect the platform the app is running on. They aren't perfect,
// and we are making assumptions here. But it's the best we can do for now.

export function isIOS() {
  // TODO: This is not a great way to detect iOS, but it's the best I can do for now.
  // - `window.platform` is deprecated
  // - `window.userAgentData.platform` is still experimental (https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/platform)
  // - `window.userAgent` also doesn't contain the required information
  return (
    // Check if it is an iPhone
    /iPhone/gi.test(window.navigator.platform) ||
    // Check if it is an iPad. iPad reports itself as "MacIntel", but we can check if it is a touch
    // screen. Let's hope that Apple doesn't release a touch screen Mac (or maybe this would then
    // work as expected 🤔).
    (/Mac/gi.test(window.navigator.platform) && window.navigator.maxTouchPoints > 0)
  )
}

export function isAndroid() {
  return /Android/gi.test(window.navigator.userAgent)
}

export function isMobile() {
  return isIOS() || isAndroid()
}
