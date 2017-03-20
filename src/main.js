import 'babel-polyfill';
import Vue from 'vue';
import 'nprogress/nprogress.css';
import resource from 'vue-resource';
import {sync} from 'vuex-router-sync';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

import App from './App'
import store from './store';
import router from './router';

Vue.use(ElementUI);
Vue.use(resource);

sync(store, router);

Vue.http.options.emulateJSON = true;
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
});

