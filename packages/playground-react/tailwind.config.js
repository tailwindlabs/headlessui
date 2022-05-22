module.exports = {
  content: ['./{pages,components}/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss'),
  ],
}
