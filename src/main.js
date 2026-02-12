import {createApp} from 'vue';
import {createPinia} from 'pinia';
import App from './App.vue';
// 如果使用vue-router，请取消注释并配置
// import router from './router';

const app = createApp(App);
app.use(createPinia());
// app.use(router);
app.mount('#app');
