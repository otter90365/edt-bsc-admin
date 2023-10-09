import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    // dark: true,
    themes: {
      light: {
        primary: '#262626',
        lightPrimary: '#99666B',
        darkPrimary1: '#513C3E',
        darkPrimary2: '#18242B',
        lightOrange: '#F1DDCD',
        warning: '#CD4949',
        lightWarning: '#EFCDD3'
      },
    },
    options: {
      customProperties: true
    }
  },
});
