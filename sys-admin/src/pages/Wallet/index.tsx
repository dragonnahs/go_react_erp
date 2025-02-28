import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, message } from 'antd';
import { WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import WalletAssets from './components/WalletAssets';
import TransactionHistory from './components/TransactionHistory';
import ImportWallet from './components/ImportWallet';
import CreateWallet from './components/CreateWallet';
import styles from './index.less';

const WalletPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [publicKey, setPublicKey] = useState<string>('');
  
  // 连接到 Solana 测试网
  const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
  const fetchBalance = async (address: string) => {
    try {
      const pubKey = new PublicKey(address);
      const balance = await connection.getBalance(pubKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      message.error('获取余额失败');
    }
  };

  useEffect(() => {
    
    // 检查本地存储的钱包信息
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      const { publicKey } = JSON.parse(savedWallet);
      setPublicKey(publicKey);
      setIsWalletConnected(true);
      fetchBalance(publicKey);
    }
  }, []);

  

  const handleDisconnect = () => {
    localStorage.removeItem('wallet');
    setIsWalletConnected(false);
    setPublicKey('');
    setBalance(0);
  };

  const items = [
    {
      key: 'assets',
      label: (
        <span>
          <WalletOutlined />
          资产
        </span>
      ),
      children: <WalletAssets balance={balance} publicKey={publicKey} />,
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          交易历史
        </span>
      ),
      children: <TransactionHistory publicKey={publicKey} />,
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        title="Solana 钱包"
        extra={
          isWalletConnected ? (
            <Button onClick={handleDisconnect} danger>
              断开连接
            </Button>
          ) : (
            <div className={styles.connectButtons}>
              <ImportWallet 
                onSuccess={(pk) => {
                  setPublicKey(pk);
                  setIsWalletConnected(true);
                  fetchBalance(pk);
                }}
              />
              <CreateWallet
                onSuccess={(pk) => {
                  setPublicKey(pk);
                  setIsWalletConnected(true);
                  fetchBalance(pk);
                }}
              />
            </div>
          )
        }
      >
        {isWalletConnected ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
          />
        ) : (
          <div className={styles.emptyState}>
            请创建或导入钱包以开始使用
          </div>
        )}
      </Card>
    </div>
  );
};

export default WalletPage; 