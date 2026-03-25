import { defineConfig } from '@umijs/max';

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
  proxy: {
    '/admin': {
      target: 'http://127.0.0.1:8802',
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
