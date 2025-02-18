/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:32:01
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-18 10:56:08
 * @FilePath: \go_react_erp\sys-admin\src\app.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

import { history, RuntimeConfig } from 'umi';
import AuthWrapper from './components/AuthWrapper';
import { getCurrentUser, getUserRoutes } from '@/services/user';
import type { CurrentUser } from '@/types/user';
import type { MenuDataItem } from '@ant-design/pro-components';
import * as Icons from '@ant-design/icons';
import React, { lazy, Suspense } from 'react';
import Menu from '@/pages/Menu';
import User from './pages/User';
import Layout from 'antd/lib/layout';
// 定义初始化状态的类型
export interface InitialState {
  currentUser?: CurrentUser;
  loading?: boolean;
  menus?: MenuDataItem[];
}
const dynamicImport = (componentName: string) => {
  return lazy(() => import(`./pages/${componentName}`));
};
// 将后端菜单数据转换为 ProLayout 需要的格式
const convertMenus = (menus: any[]): MenuDataItem[] => {
  return menus.map(menu => {
    if(menu.component) {
      const Element = dynamicImport(menu.component);
      return {
        path: menu.path,
        name: menu.name,
        icon: React.createElement(Icons[menu.icon]),
        element: <Suspense fallback={<div>Loading...</div>}>{<Element/>}</Suspense>,
        children: menu.children ? convertMenus(menu.children) : undefined,
      }
    }else {
      return {
        path: menu.path,
        name: menu.name,
        icon: React.createElement(Icons[menu.icon]),
        children: menu.children ? convertMenus(menu.children) : undefined,
      }
    }
  });
};

// 获取初始化状态
export async function getInitialState(): Promise<InitialState> {
  // 如果是登录页面，直接返回空对象
  const { pathname } = window.location;
  if (pathname === '/login') {
    return {};
  }

  // 如果没有 token，也直接返回空对象
  const token = localStorage.getItem('token');
  if (!token) {
    history.push('/login');
    return {};
  }

  try {
    // 获取用户信息和路由权限
    const [userRes, routesRes] = await Promise.all([
      getCurrentUser(),
      getUserRoutes()
    ]);
    return {
      currentUser: userRes.data,
      menus: [{path: '/', name: '首页', icon: React.createElement(Icons['HomeOutlined'])}, ...convertMenus(routesRes.data.routes)],
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 如果获取用户信息失败，重定向到登录页
    history.push('/login');
    return {};
  }
}

export const layout = ({initialState}: {initialState: InitialState}) => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    title: '系统管理',
    menu: {
      // 从全局状态获取菜单数据
      request: async () => {
        return initialState?.menus || [];
      },
    },
    // 可以通过 token 来控制用户访问
    logout: () => {
      localStorage.removeItem('token');
      history.push('/login');
    },
    // 自定义头像下拉菜单项
    avatarProps: {
      render: (_: any, dom: any) => {
        return dom;
      },
    },
  };
};

export function rootContainer(container: React.ReactNode) {
  return <AuthWrapper>{container}</AuthWrapper>;
} 
let extraMenu: MenuDataItem[] = [];
export const patchClientRoutes = ({routes}: RuntimeConfig) => {
  const parentRoutes = routes.find((route: MenuDataItem) => route.path === '/');
  if(parentRoutes && parentRoutes.routes) {
    parentRoutes.routes.push(...extraMenu);
  }
  console.log(parentRoutes, 'routes');
}
export function render(oldRender: () => void) {
  getUserRoutes().then((menu) => {
    extraMenu = convertMenus(menu.data.routes); 
    oldRender();
  });
}