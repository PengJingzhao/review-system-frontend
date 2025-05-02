import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 导入Markdown编辑器
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// 创建Pinia实例
const pinia = createPinia()

// 创建Vue应用实例
const app = createApp(App)

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.component('MdEditor', MdEditor)

// 挂载应用
app.mount('#app') 