import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
import VueCookies from 'vue-cookies'
Vue.use(VueCookies)

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here

Vue.use(VueMaterial)


import axios from 'axios'
Vue.use(axios)


import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
