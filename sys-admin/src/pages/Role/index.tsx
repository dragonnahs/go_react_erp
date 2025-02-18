import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Switch, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getRoleList, deleteRole } from '@/services/role';
import RoleForm from './components/RoleForm';
import { RoleItem } from '@/types/role';

const RoleList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleItem>();
  const actionRef = useRef<ActionType>();

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该角色吗？',
      onOk: async () => {
        try {
          await deleteRole(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          // 错误处理由请求拦截器统一处理
        }
      },
    });
  };

  const columns: ProColumns<RoleItem>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status ? 'success' : 'default'}>
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Space>
          <a onClick={async () => {
            await setCurrentRole(record);
            setModalVisible(true);
          }}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<RoleItem>
        headerTitle="角色列表"
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
            onClick={() => {
              setCurrentRole(undefined);
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await getRoleList(params);
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
      <RoleForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          actionRef.current?.reload();
        }}
        record={currentRole}
      />
    </>
  );
};

export default RoleList; 