import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Toasted from 'vue-toasted'
import clipboard2 from './plugins/vue-clipboard2'

const cookies = require('vue-cookies')

Vue.config.productionTip = false

const app = new Vue({
  router,
  store,
  vuetify,
  clipboard2,
  render: h => h(App)
}).$mount('#app')

Vue.use(cookies);
Vue.use(Toasted, {
  // router,
  position: 'top-center',
  duration: 2000,
});

export default app