import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';
import { createUser, deleteUser, getUserList } from '@/services/user';
import UserForm from './components/UserForm';

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

const UserList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem>();
  const actionRef = useRef<ActionType>();

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          // 错误处理由请求拦截器统一处理
        }
      },
    });
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      valueEnum: {
        admin: { text: '管理员' },
        user: { text: '普通用户' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '禁用', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a onClick={() => {
            setCurrentUser(record);
            setModalVisible(true);
          }}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<UserItem>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={async() => {
              await setCurrentUser(undefined);
              await setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getUserList(params);
            console.log(response, '----------');
            return {              
              data: response.data.items,
              success: true,
              total: response.data.total,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
      />
      <UserForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          actionRef.current?.reload();
        }}
        record={currentUser}
      />
    </>
  );
};

export default UserList; 