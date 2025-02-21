import {
  AlipayCircleOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormText,
} from '@ant-design/pro-components';
import { message, Tabs } from 'antd';
import { useState } from 'react';
import { history, useLocation } from 'umi';
import request from '@/utils/request';

type LoginType = 'login' | 'register';

export default () => {
  const [loginType, setLoginType] = useState<LoginType>('login');
  const location = useLocation();

  const handleSubmit = async (values: any) => {
    try {
      const endpoint = loginType === 'login' ? '/login' : '/register';
      const response = await request.post(endpoint, values);
      
      // 保存token
      localStorage.setItem('token', response.data.token);
      
      message.success(
        loginType === 'login' ? '登录成功！' : '注册成功！'
      );
      
      // 获取重定向地址
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      // 如果有重定向地址则跳转到重定向地址，否则跳转到首页
      history.replace(redirect || '/');
      window.location.reload();
    } catch (error) {
      // 错误处理由响应拦截器统一处理
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <LoginForm
        logo="https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg"
        title="ERP System"
        subTitle="企业资源管理系统"
        onFinish={handleSubmit}
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
          items={[
            { key: 'login', label: '登录' },
            { key: 'register', label: '注册' },
          ]}
        />
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder="用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
            {
              min: 3,
              message: '用户名至少3个字符',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="密码"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
            {
              min: 6,
              message: '密码至少6个字符',
            },
          ]}
        />
        {loginType === 'register' && (
          <>
            <ProFormText
              name="email"
              fieldProps={{
                size: 'large',
                prefix: <AlipayCircleOutlined />,
              }}
              placeholder="邮箱"
              rules={[
                {
                  required: true,
                  message: '请输入邮箱！',
                },
                {
                  type: 'email',
                  message: '请输入有效的邮箱地址！',
                },
              ]}
            />
            <ProFormText
              name="role"
              initialValue="user"
              hidden
            />
          </>
        )}
      </LoginForm>
    </div>
  );
}; 