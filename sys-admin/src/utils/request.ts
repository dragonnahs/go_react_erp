/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 18:10:58
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 12:19:10
 * @FilePath: \go_react_erp\sys-admin\src\utils\request.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%A
 */
import { message } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import { history } from 'umi';

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return response.data;
    } else {
      return Promise.reject(response.data);
    }
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // 清除token
        localStorage.removeItem('token');
        message.error('登录已过期，请重新登录');
        // 重定向到登录页
        history.push('/login');
      } else {
        message.error(error.response.data?.error || '请求失败');
      }
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default request; 