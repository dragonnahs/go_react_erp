import Icon, { PlusOutlined }  from '@ant-design/icons';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getMenuList, deleteMenu, getMenuTree } from '@/services/menu';
import MenuForm from './components/MenuForm';
import { MenuItem } from '@/types/menu';
import React from 'react';
import * as Icons from '@ant-design/icons';

const MenuList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuItem>();
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const actionRef = useRef<ActionType>();

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该菜单吗？',
      onOk: async () => {
        try {
          await deleteMenu(id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          // 错误处理由请求拦截器统一处理
        }
      },
    });
  };

  const loadMenuTree = async () => {
    try {
      const res = await getMenuTree();
      setMenuTree(res.data.items);
    } catch (error) {
      console.error('加载菜单树失败:', error);
    }
  };

  const columns: ProColumns<MenuItem>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      render: (_, record) => {
        if(record.icon) {
          return React.createElement(Icons[record.icon])
        }else {
          return '无'
        }
      },
    },
    {
      title: '路由路径',
      dataIndex: 'path',
    },
    {
      title: '组件路径',
      dataIndex: 'component',
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type) => (
        <Tag color={type === 'menu' ? 'blue' : 'green'}>
          {type === 'menu' ? '菜单' : '按钮'}
        </Tag>
      ),
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
    },
    {
      title: '显示状态',
      dataIndex: 'visible',
      width: 100,
      render: (visible) => (
        <Tag color={visible ? 'success' : 'default'}>
          {visible ? '显示' : '隐藏'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Space>
          <a onClick={async () => {
            await loadMenuTree()
            setCurrentMenu(record);
            setModalVisible(true);
          }}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];
  return (
    <>
      <ProTable<MenuItem>
        headerTitle="菜单列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={async () => {
              await loadMenuTree()
              setCurrentMenu(undefined);
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
        request={async () => {
          try {
            const response = await getMenuList({});
            console.log('Menu data:', response.data.items); // 查看返回的数据结构
            return {
              data: response.data.items,
              success: true,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
            };
          }
        }}
        columns={columns}
        expandable={{
          defaultExpandAllRows: true,
        }}
      />
      <MenuForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          actionRef.current?.reload();
        }}
        record={currentMenu}
        menuTree={menuTree}
      />
    </>
  );
};

export default MenuList; 