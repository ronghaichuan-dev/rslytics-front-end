import { defineConfig } from '@umijs/max';

const API_TARGET = process.env.API_TARGET || 'https://dev.godlikeaid.com';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '归因数据管理系统',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    title: false,
    baseNavigator: false,
  },
  define: {
    API_TARGET,
  },
  proxy: {
    '/admin': {
      target: API_TARGET,
      changeOrigin: true,
    },
  },
  routes: [
    {
      path: '/login',
      component: './login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '数据大盘',
      path: '/dashboard',
      component: './dashboard',
    },
    {
      name: '系统管理',
      path: '/system',
      routes: [
        {
          name: '用户管理',
          path: '/system/user',
          component: './system/user',
        },
        {
          name: '角色管理',
          path: '/system/role',
          component: './system/role',
        },
        {
          name: '权限管理',
          path: '/system/permission',
          component: './system/permission',
        },
        {
          name: '组织管理',
          path: '/system/company',
          component: './system/company',
        },
        {
          name: '账号管理',
          path: '/system/account',
          component: './system/account',
        },
      ],
    },
    {
      name: '应用管理',
      path: '/app',
      component: './app',
    },
    {
      name: '事件管理',
      path: '/event',
      routes: [
        {
          name: '事件定义',
          path: '/event',
          component: './event',
        },
        {
          name: '事件日志',
          path: '/event/log',
          component: './event/log',
        },
      ],
    },
    {
      name: '订阅管理',
      path: '/subscription',
      component: './subscription',
    },
    {
      name: '通知记录',
      path: '/notification',
      component: './notification',
    },
    {
      name: '系统设置',
      path: '/settings',
      component: './settings',
    },
    { path: '*', redirect: '/dashboard' },
  ],
  npmClient: 'npm',
});
