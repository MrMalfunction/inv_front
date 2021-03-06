import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue')
  },
  {
    path: "/Data_In",
    name: "Data_In",
    component: () => import('../views/data_in.vue')
  },
  {
    path:"/Data_Out",
    name: "Data_Out",
    component: () => import('../views/data_out.vue')
  },
  {
    path: "/View_Live",
    name: "Live Inventory",
    component: () => import('../views/live_inv')
  },
  {
    path: "/View_Past",
    name: "Past Transactions",
    component: () => import('../views/pastTransactions')
  },
  {
    path: "/Retail",
    name: "Retail",
    component: () => import('../views/retail')
  },
  {
    path: "/SignUp",
    name: "SignUp",
    component: () => import('../views/SignUp')
  },
  {
    path: "/Reset",
    name: "Reset",
    component: () => import('../views/Reset')
  },
  {
    path: "/Export",
    name: "Export",
    component: () => import('../views/Export')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
