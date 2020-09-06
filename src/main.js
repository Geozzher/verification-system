// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import VueResource from "vue-resource";
// import convert from  './assets/js/sqlConvert/sqlParse'


Vue.config.productionTip = false
Vue.use(ViewUI);
Vue.use(VueResource)
// Vue.use(convert)
// Vue.prototype.$sqlConvert = sqlConvert

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
