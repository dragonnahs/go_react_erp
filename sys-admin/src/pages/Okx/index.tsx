/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-03-11 18:19:35
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-03-12 09:45:20
 * @FilePath: \go_react_erp\sys-admin\src\pages\Okx\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect } from 'react';
import { history } from 'umi';
export default function Okx() {
  const getOkx = async () => {
    const tokenAddress = history.location.search.split('=')[1];
    console.log(tokenAddress, 'tokenAddress');
    const res = await fetch(`http://47.94.226.174:8081/api/token?address=${tokenAddress}`);
    const data = await res.json();
    console.log(data, 'data');
    if(data.data) {
      window.location.replace(`https://www.okx.com/zh-hans/web3/detail/${data.data.chainId}/${data.data.tokenAddress}`);
    }
  }
  useEffect(() => {
    getOkx();
  }, []);
  return <div>Okx</div>;
}
