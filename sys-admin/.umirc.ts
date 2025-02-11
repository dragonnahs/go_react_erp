/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:32:01
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 13:45:56
 * @FilePath: \go_react_erp\sys-admin\.umirc.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  alias: {
    '@': '/src',
  },
  routes: [
    {
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      path: '/user',
      name: '用户管理',
      icon: 'UserOutlined',
      component: './User',
    },
    {
      path: '/menu',
      name: '菜单管理',
      icon: 'MenuOutlined',
      component: './Menu',
    },
    {
      path: '*',
      component: './404',
      layout: false,
    },
  ],
  npmClient: 'yarn',
});

