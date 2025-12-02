import { createApp } from 'vue';
import App from './App.vue';
import { store } from './store';

import axios from 'axios';
import VueAxios from 'vue-axios';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dtoolTheme',
    themes: {
      dtoolTheme: {
        dark: false,
        colors: {
          primary: '#7B1FA2',       // Purple 700 (Material purple)
          'primary-darken-1': '#6A1B9A',
          secondary: '#9C27B0',     // Purple 500
          accent: '#E040FB',        // Purple A200
          error: '#F44336',         // Red 500
          warning: '#FF9800',       // Orange 500
          info: '#2196F3',          // Blue 500
          success: '#4CAF50',       // Green 500
          surface: '#FFFFFF',
          background: '#FAFAFA',
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'flat',
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
    },
  }
});

const app = createApp(App);

app.use(vuetify);
app.use(store);
app.use(VueAxios, axios);
app.config.productionTip = false;
app.mount('#app');
