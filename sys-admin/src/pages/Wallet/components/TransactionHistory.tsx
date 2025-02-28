import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography } from 'antd';
import { Connection, PublicKey } from '@solana/web3.js';
import dayjs from 'dayjs';

interface TransactionHistoryProps {
  publicKey: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ publicKey }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const pubKey = new PublicKey(publicKey);
      const signatures = await connection.getSignaturesForAddress(pubKey);
      
      const txs = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            timestamp: sig.blockTime ? dayjs.unix(sig.blockTime).format('YYYY-MM-DD HH:mm:ss') : '-',
            status: sig.confirmationStatus,
            amount: tx?.meta?.fee || 0,
          };
        })
      );
      
      setTransactions(txs);
    } catch (error) {
      console.error('获取交易历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  

  const columns = [
    {
      title: '交易哈希',
      dataIndex: 'signature',
      key: 'signature',
      render: (text: string) => (
        <Typography.Text copyable ellipsis style={{ width: 150 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'finalized' ? 'success' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '手续费(SOL)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (amount / 1e9).toFixed(6),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      loading={loading}
      rowKey="signature"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TransactionHistory; 