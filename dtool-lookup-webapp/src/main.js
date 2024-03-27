import { createApp } from 'vue';
import App from './App.vue';
import { store } from './store';

import axios from 'axios';
import { createBootstrap } from 'bootstrap-vue-next'; 
import VueAxios from 'vue-axios';
import { VueClipboard } from '@soerenmartius/vue3-clipboard';

import './assets/css/custom.scss';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'; 

const app = createApp(App);

app.use(createBootstrap());
app.use(VueClipboard);
app.use(store);
app.use(VueAxios, axios);
app.config.productionTip = false;
app.mount('#app');
