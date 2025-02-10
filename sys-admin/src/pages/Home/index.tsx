/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:32:01
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-08 18:26:09
 * @FilePath: \go_react_erp\sys-admin\src\pages\Home\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel, history } from '@umijs/max';
import styles from './index.less';
import { Button } from 'antd';
const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const goLogin = () => {
    history.push('/login');
  };
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
        <Button onClick={goLogin}>登录</Button>
      </div>
    </PageContainer>
  );
};

export default HomePage;
