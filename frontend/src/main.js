import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.globalProperties.$forceTheme = () => {
  document.documentElement.setAttribute('data-theme', 'rabbithole');
  document.documentElement.style.colorScheme = 'dark';
}

app.use(createPinia())
app.use(router)

app.mount('#app')

document.documentElement.setAttribute('data-theme', 'rabbithole');
document.documentElement.style.colorScheme = 'dark';