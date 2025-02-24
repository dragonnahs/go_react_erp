/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:37:51
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-21 16:40:37
 * @FilePath: \go_react_erp\sys-admin\src\services\project.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request';
import type { Project, TaskStatus } from '@/types/project';

// 获取项目详情
export const getProject = (id?: string) => {
  return request.get<{ data: Project }>('/projects/current');
};

// 更新任务位置
export const updateTaskPosition = (params: {
  taskId: number;
  newPhase: string;
  newStartDate: string;
}) => {
  return request(`/tasks/${params.taskId}/position`, {
    method: 'PUT',
    data: {
      newPhase: params.newPhase,
      newStartDate: params.newStartDate,
    },
  });
};

// 更新任务状态
export const updateTaskStatus = (taskId: string, status: TaskStatus) => {
  return request.put(`/tasks/${taskId}/status`, { status });
};

// 创建任务
export const createTask = (data: {
  projectId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  phase: string;
}) => {
  return request.post('/tasks', data);
};

// 更新任务
export const updateTask = (taskId: string, data: {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}) => {
  return request.put(`/tasks/${taskId}`, data);
};

// 删除任务
export const deleteTask = (taskId: string) => {
  return request.delete(`/tasks/${taskId}`);
};

// 获取项目列表
export const getProjectList = (params: {
  current?: number;
  pageSize?: number;
  name?: string;
}) => {
  return request.get('/projects', { params });
};

// 创建项目
export const createProject = (data: {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}) => {
  return request.post('/projects', data);
};

// 更新项目
export const updateProject = (id: string, data: {
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}) => {
  return request.put(`/projects/${id}`, data);
};

// 删除项目
export const deleteProject = (id: string) => {
  return request.delete(`/projects/${id}`);
}; 