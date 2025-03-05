/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-28 16:53:55
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-28 17:03:51
 * @FilePath: \go_react_erp\sys-admin\src\pages\Wallet\components\WalletAssets.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import { Card, Typography, Space, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { copyToClipboard } from '@/utils/clipboard';

interface WalletAssetsProps {
  balance: number;
  publicKey: string;
}

const WalletAssets: React.FC<WalletAssetsProps> = ({ balance, publicKey }) => {
  return (
    <div>
      <Card size="small" title="钱包地址">
        <Space>
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {publicKey}
          </Typography.Text>
          <Tooltip title="复制地址">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(publicKey)}
            />
          </Tooltip>
        </Space>
      </Card>

      <Card
        size="small"
        title="ETH 余额"
        style={{ marginTop: 16 }}
      >
        <Typography.Title level={2}>
          {balance.toFixed(4)} ETH
        </Typography.Title>
      </Card>

      <Card
        size="small"
        title="代币资产"
        style={{ marginTop: 16 }}
      >
        {/* 这里可以添加其他代币资产的展示 */}
      </Card>
    </div>
  );
};

export default WalletAssets; 