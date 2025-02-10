/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 18:11:10
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 10:18:22
 * @FilePath: \go_react_erp\sys-admin\src\components\AuthWrapper\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { history } from 'umi';

// 不需要登录就可以访问的路径
const PUBLIC_PATHS = ['/login', '/register'];

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pahtname = window.location.pathname
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // 检查是否需要登录
    const needAuth = !PUBLIC_PATHS.includes(pahtname);
    console.log(needAuth, '+++++', history, token)
    
    if (needAuth && !token) {
      // 需要登录但没有token，重定向到登录页
      history.push('/login');
    } else if (!needAuth && token) {
      // 已登录但访问登录页，重定向到首页
      history.push('/');
    }
    
    // 延迟一点时间，避免闪烁
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [location.pathname, token]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果不需要登录或者已经登录，显示内容
  if (!PUBLIC_PATHS.includes(location.pathname) && !token) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper; 