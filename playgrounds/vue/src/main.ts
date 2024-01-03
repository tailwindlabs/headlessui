import { createApp } from 'vue'
// @ts-expect-error TODO: Properly handle this
import App from './App.vue'
import router from './router'

import 'tailwindcss/tailwind.css'

createApp(App).use(router).mount('#app')
