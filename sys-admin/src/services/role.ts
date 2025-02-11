import request from '@/utils/request';
import { RoleItem } from '@/types/role';

// 获取角色列表
export async function getRoleList(params: {
  current?: number;
  pageSize?: number;
  name?: string;
}) {
  return request.get('/roles', { params });
}

// 创建角色
export async function createRole(data: Partial<RoleItem>) {
  return request.post('/roles', data);
}

// 更新角色
export async function updateRole(id: number, data: Partial<RoleItem>) {
  return request.put(`/roles/${id}`, data);
}

// 删除角色
export async function deleteRole(id: number) {
  return request.delete(`/roles/${id}`);
}

// 获取角色详情
export async function getRoleById(id: number) {
  return request.get(`/roles/${id}`);
} 