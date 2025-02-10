import request from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  email: string;
  role: string;
}

export const login = (params: LoginParams) => {
  return request.post('/login', params);
};

export const register = (params: RegisterParams) => {
  return request.post('/register', params);
};

export const getUserList = (params: any) => {
  return request.get('/users', { params });
};

export const createUser = (data: any) => {
  return request.post('/users', data);
};

export const updateUser = (id: number, data: any) => {
  return request.put(`/users/${id}`, data);
};

export const deleteUser = (id: number) => {
  return request.delete(`/users/${id}`);
};

export const getUserById = (id: number) => {
  return request.get(`/users/${id}`);
}; 