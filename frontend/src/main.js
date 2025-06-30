import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Force theme on app mount
app.config.globalProperties.$forceTheme = () => {
  document.documentElement.setAttribute('data-theme', 'rabbithole');
  document.documentElement.style.colorScheme = 'dark';
}

app.use(createPinia())
app.use(router)

app.mount('#app')

// Force theme immediately
document.documentElement.setAttribute('data-theme', 'rabbithole');
document.documentElement.style.colorScheme = 'dark';