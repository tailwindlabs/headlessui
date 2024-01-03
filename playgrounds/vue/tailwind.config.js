/** @type {import('tailwindcss/types').Config} */
let config = {
  content: ['./src/**/*.vue', './*.html'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss'),
  ],
}

module.exports = config
