import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../components/Dashboard.vue";
import Login from "../components/Login.vue";

const routes = [
    {path: '/login', component: Login},
    {path: '/dashboard', component: Dashboard}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    if(to.path === '/dashboard'){
        if(!sessionStorage.getItem('token')){
            return '/login';
        }
    }
});

export default router;