/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-10 13:42:01
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 13:57:04
 * @FilePath: \go_react_erp\sys-admin\src\components\IconSelect\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { ProFormSelect } from '@ant-design/pro-components';
import * as Icons from '@ant-design/icons';
import React from 'react';
const IconSelect = ({ value, onChange, ...props }) => {
  const iconList = Object.keys(Icons)
    .filter(key => key.endsWith('Outlined'))
    .map(key => ({
      label: (
        <div>
          {React.createElement(Icons[key])}
          <span style={{ marginLeft: 8 }}>{key}</span>
        </div>
      ),
      value: key,
    }));

  return (
    <ProFormSelect
      {...props}
      options={iconList}
      fieldProps={{
        showSearch: true,
        optionFilterProp: 'children',
      }}
    />
  );
};

export default IconSelect; 