import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag, Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { getHotMemeTokens } from '@/services/memeToken';

interface MemeToken {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  price_change_1h: number;
  volume_24h: number;
  market_cap: number;
  holders: number;
  created_at: string;
}

const MemeTokenList = () => {
  const columns: ProColumns<MemeToken>[] = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 80,
      align: 'center',
      render: (rank) => (
        <Tag color={Number(rank) <= 3 ? 'volcano' : 'default'}>
          {rank}
        </Tag>
      ),
    },
    {
      title: '代币',
      dataIndex: 'symbol',
      render: (_, record) => (
        <Space>
          <span>{record.name}</span>
          <Tag>{record.symbol}</Tag>
        </Space>
      ),
    },
    {
      title: '价格(USD)',
      dataIndex: 'price',
      align: 'right',
      render: (price) => `$${Number(price).toFixed(8)}`,
    },
    {
      title: '1h涨跌',
      dataIndex: 'price_change_1h',
      align: 'right',
      render: (change) => (
        <span style={{ color: Number(change) >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {Number(change) >= 0 ? '+' : ''}{Number(change).toFixed(2)}%
        </span>
      ),
    },
    {
      title: '24h成交额',
      dataIndex: 'volume_24h',
      align: 'right',
      render: (volume) => `$${Number(volume).toLocaleString()}`,
    },
    {
      title: '市值',
      dataIndex: 'market_cap',
      align: 'right',
      render: (cap) => `$${Number(cap).toLocaleString()}`,
    },
    {
      title: '持有人数',
      dataIndex: 'holders',
      align: 'right',
      render: (holders) => Number(holders).toLocaleString(),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
  ];

  return (
    <ProTable<MemeToken>
      headerTitle={
        <Space>
          <FireOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span>最火Meme币</span>
          <Tag color="success">
            1h 趋势
          </Tag>
        </Space>
      }
      rowKey="symbol"
      search={false}
      options={{
        density: false,
        fullScreen: true,
        reload: true,
      }}
      pagination={{
        pageSize: 20,
      }}
      request={async () => {
        try {
          const response = await getHotMemeTokens();
          return {
            data: response.data,
            success: true,
            total: response.data.length,
          };
        } catch (error) {
          message.error('获取数据失败');
          return {
            data: [],
            success: false,
            total: 0,
          };
        }
      }}
      columns={columns}
    />
  );
};

export default MemeTokenList; 