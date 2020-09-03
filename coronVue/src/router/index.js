import Vue from 'vue'
import Router from 'vue-router'
import AppLayout from '../components/admin/AppLayout'

Vue.use(Router)

const EmptyParentComponent = {
  template: '<router-view></router-view>',
}

const demoRoutes = []

export default new Router({
  mode: process.env.VUE_APP_ROUTER_MODE_HISTORY === 'true' ? 'history' : 'hash',
  routes: [
    ...demoRoutes,
    {
      path: '*',
      redirect: { name: 'coronavirus' },
    },
    {
      path: '/404',
      component: EmptyParentComponent,
      children: [
        {
          name: 'not-found-advanced',
          path: 'not-found-advanced',
          component: () => import('../components/pages/404-pages/VaPageNotFoundSearch.vue'),
        },
        {
          name: 'not-found-simple',
          path: 'not-found-simple',
          component: () => import('../components/pages/404-pages/VaPageNotFoundSimple.vue'),
        },
        {
          name: 'not-found-custom',
          path: 'not-found-custom',
          component: () => import('../components/pages/404-pages/VaPageNotFoundCustom.vue'),
        },
        {
          name: 'not-found-large-text',
          path: '/pages/not-found-large-text',
          component: () => import('../components/pages/404-pages/VaPageNotFoundLargeText.vue'),
        },
      ],
    },
    {
      path: '/corona',
      component: AppLayout,
      children: [
        {
          name: 'coronavirus',
          path: 'coronavirus',
          component: () => import('../corona/world/CoronaMain.vue'),
          default: true,
        },
        {
          name: 'coronavirus',
          path: 'coronavirus/:id',
          component: () => import('../corona/world/CoronaMain.vue'),
          default: true,
        },
      ],
    },
    {
      path: '/coronamaps',
      component: AppLayout,
      children: [
        {
          name: 'coronamaps',
          path: 'coronamaps',
          component: () => import('../corona/world/CoronaMapsPage.vue'),
          default: true,
        },
      ],
    },
    {
      path: '/coronanations',
      component: AppLayout,
      children: [
        {
          name: 'italy',
          path: 'italy',
          component: () => import('../corona/italy/CoronaMainItaly.vue'),
          default: true,
        },
        {
          name: 'italy',
          path: 'italy/:id',
          component: () => import('../corona/italy/CoronaMainItaly.vue'),
          default: true,
        },
        {
          name: 'mapsitaly',
          path: 'mapsitaly',
          component: () => import('../corona/italy/CoronaMapsPage.vue'),
          default: true,
        },
      ],
    },
  ],
})
