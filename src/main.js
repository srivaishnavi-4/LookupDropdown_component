import { createApp } from 'vue'
import App from './App.vue'
import halleyxKit from 'halleyx-ui-framework'
//load the styles
import 'halleyx-ui-framework/dist/es/index.css';
import './assets/main.css'

createApp(App).use(halleyxKit).mount("#app");
