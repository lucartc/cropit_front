import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppView from '../views/AppView.vue'
import TestView from '../views/TestView.vue'
import ImageCropper from '../views/ImageCropper.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/app',
      name: 'app',
      component: AppView
    },
    {
      path: '/test',
      name: 'test',
      component: TestView
    }
  ]
})

export default router
