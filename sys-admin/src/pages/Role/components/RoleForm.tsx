import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSwitch,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { FormInstance, message, Tree } from 'antd';
import { createRole, updateRole } from '@/services/role';
import { getFullMenuTree } from '@/services/menu';
import { useRef, useEffect, useState } from 'react';
import { RoleItem } from '@/types/role';
import type { MenuItem } from '@/types/menu';

interface RoleFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record?: RoleItem;
}

const RoleForm: React.FC<RoleFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  record,
}) => {
  const formRef = useRef<FormInstance>();
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (visible) {
      loadMenuTree();
      if (record) {
        formRef.current?.setFieldsValue(record);
        setSelectedKeys(record.menu_ids.map(id => id.toString()));
      } else {
        formRef.current?.resetFields();
      }
    }
  }, [visible, record]);

  const loadMenuTree = async () => {
    try {
      const res = await getFullMenuTree();
      setMenuTree(res.data.items);
    } catch (error) {
      console.error('加载菜单树失败:', error);
    }
  };

  // 递归获取所有子节点的key
  const getChildrenKeys = (node: MenuItem): string[] => {
    const keys: string[] = [];
    if (node.children) {
      node.children.forEach(child => {
        keys.push(child.id.toString());
        keys.push(...getChildrenKeys(child));
      });
    }
    return keys;
  };

  // 递归获取所有父节点的key
  const getParentKeys = (tree: MenuItem[], targetKey: string): string[] => {
    const parentKeys: string[] = [];
    const traverse = (nodes: MenuItem[], parent?: MenuItem) => {
      for (const node of nodes) {
        if (node.id.toString() === targetKey && parent) {
          parentKeys.push(parent.id.toString());
        }
        if (node.children) {
          traverse(node.children, node);
        }
      }
    };
    traverse(tree);
    return parentKeys;
  };

  // 处理选中节点变化
  const handleCheck = (checkedKeys: React.Key[], info: any) => {
    const { node, checked } = info;
    let newSelectedKeys = Array.from(new Set(checkedKeys as string[]));

    if (checked) {
      // 选中节点时，添加所有子节点
      if (node.children) {
        const childrenKeys = getChildrenKeys(node);
        newSelectedKeys = Array.from(new Set([...newSelectedKeys, node.key, ...childrenKeys]));
      }
      // 添加父节点
      const parentKeys = getParentKeys(menuTree, node.key);
      newSelectedKeys = Array.from(new Set([...newSelectedKeys, ...parentKeys]));
    } else {
      // 取消选中时，移除所有子节点
      if (node.children) {
        const childrenKeys = getChildrenKeys(node);
        newSelectedKeys = newSelectedKeys.filter(key => 
          key !== node.key && !childrenKeys.includes(key.toString())
        );
      }
      // 检查是否需要取消选中父节点
      const parentKeys = getParentKeys(menuTree, node.key);
      parentKeys.forEach(parentKey => {
        const parent = menuTree.find(item => item.id.toString() === parentKey);
        if (parent) {
          const siblings = getChildrenKeys(parent);
          const hasSelectedSibling = siblings.some(siblingKey => 
            newSelectedKeys.includes(siblingKey)
          );
          if (!hasSelectedSibling) {
            newSelectedKeys = newSelectedKeys.filter(key => key !== parentKey);
          }
        }
      });
    }

    setSelectedKeys(newSelectedKeys);
  };

  const handleSubmit = async (values: any) => {
    try {
      // 将选中的菜单ID转换为数字类型，并去重
      const menuIds = Array.from(new Set(selectedKeys.map(key => parseInt(key.toString()))));
      const submitData = {
        ...values,
        menu_ids: menuIds,
      };

      if (record?.id) {
        await updateRole(record.id, submitData);
        message.success('更新成功');
      } else {
        await createRole(submitData);
        message.success('创建成功');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  return (
    <ModalForm
      title={record ? '编辑角色' : '新建角色'}
      width={600}
      visible={visible}
      formRef={formRef}
      onFinish={handleSubmit}
      onVisibleChange={(visible) => {
        if (!visible) {
          onCancel();
        }
      }}
    >
      <ProFormText
        name="name"
        label="角色名称"
        rules={[{ required: true, message: '请输入角色名称' }]}
      />
      <ProFormText
        name="code"
        label="角色编码"
        rules={[{ required: true, message: '请输入角色编码' }]}
      />
      <ProFormTextArea
        name="description"
        label="角色描述"
        rules={[{ required: true, message: '请输入角色描述' }]}
      />
      <ProFormSwitch
        name="status"
        label="状态"
        initialValue={true}
      />
      <ProFormDigit
        name="sort"
        label="显示排序"
        initialValue={0}
        rules={[{ required: true, message: '请输入显示排序' }]}
      />
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>菜单权限</div>
        <Tree
          checkable
          checkedKeys={selectedKeys}
          onCheck={handleCheck}
          treeData={menuTree}
          fieldNames={{
            title: 'name',
            key: 'id',
            children: 'children',
          }}
        />
      </div>
    </ModalForm>
  );
};

export default RoleForm; 