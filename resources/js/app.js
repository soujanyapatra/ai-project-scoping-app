import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { createI18n } from 'vue-i18n'

import App from '@/App.vue'
import en from '@/locales/en.json'
import 'primeicons/primeicons.css'
import '@/styles/primevue/index.css'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { darkModeSelector: 'system' },
  },
})
app.mount('#app')
