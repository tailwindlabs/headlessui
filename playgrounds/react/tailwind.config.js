/** @type {import('tailwindcss/types').Config} */
let config = {
  content: ['./{pages,components}/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss'),
  ],
}

module.exports = config
