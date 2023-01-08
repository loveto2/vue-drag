import 'modern-normalize'
import App from './App.vue'
import drag from './lib/drag'

const app = createApp(App)
app.use(drag)
app.mount('#app')
