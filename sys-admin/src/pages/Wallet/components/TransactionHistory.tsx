import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { ethers } from 'ethers';

interface TransactionHistoryProps {
  publicKey: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ publicKey }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/ec1a63ba444f4ecb8c71a67fbbbbe065');
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // 使用 Etherscan API 获取地址的交易记录(infura不能获取当前钱包的交易记录，而是获取所有的，所以最好是通过etherscan获取)
      const response = await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${publicKey}&startblock=0&endblock=99999999&sort=desc&apikey=ec1a63ba444f4ecb8c71a67fbbbbe065`
      );
      const data = await response.json();
      
      if (data.status === '1') {
        const txs = await Promise.all(
          data.result.map(async (tx: any) => ({
            hash: tx.hash,
            timestamp: dayjs(Number(tx.timeStamp) * 1000).format('YYYY-MM-DD HH:mm:ss'),
            status: tx.isError === '0' ? 'success' : 'failed',
            value: ethers.formatEther(tx.value),
            from: tx.from,
            to: tx.to,
            gasUsed: ethers.formatEther(BigInt(tx.gasUsed) * BigInt(tx.gasPrice)),
          }))
        );
        setTransactions(txs);
      }
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
      dataIndex: 'hash',
      key: 'hash',
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
      title: '发送方',
      dataIndex: 'from',
      key: 'from',
      render: (text: string) => (
        <Typography.Text copyable ellipsis style={{ width: 150 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: '接收方',
      dataIndex: 'to',
      key: 'to',
      render: (text: string) => (
        <Typography.Text copyable ellipsis style={{ width: 150 }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: '数量(ETH)',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => Number(value).toFixed(6),
    },
    {
      title: 'Gas费用(ETH)',
      dataIndex: 'gasUsed',
      key: 'gasUsed',
      render: (gas: string) => Number(gas).toFixed(6),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={transactions}
      loading={loading}
      rowKey="hash"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default TransactionHistory; 