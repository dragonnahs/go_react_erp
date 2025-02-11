import request from '@/utils/request';
import { MenuItem } from '@/types/menu';

export const getMenuList = (params: any) => {
  return request.get('/menus', { params });
};

export const createMenu = (data: Partial<MenuItem>) => {
  return request.post('/menus', data);
};

export const updateMenu = (id: number, data: Partial<MenuItem>) => {
  return request.put(`/menus/${id}`, data);
};

export const deleteMenu = (id: number) => {
  return request.delete(`/menus/${id}`);
};

export const getMenuTree = () => {
  return request.get('/menus/tree');
};

// 获取完整菜单树（包括按钮）
export async function getFullMenuTree() {
  return request.get('/menus/full-tree');
} 