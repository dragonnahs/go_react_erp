import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSwitch,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { FormInstance, message } from 'antd';
import { createRole, updateRole } from '@/services/role';
import { getFullMenuTree } from '@/services/menu';
import { useRef, useEffect, useState } from 'react';
import { RoleItem } from '@/types/role';

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
  const [menuTree, setMenuTree] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      loadMenuTree();
      if (record) {
        formRef.current?.setFieldsValue(record);
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

  return (
    <ModalForm
      title={record ? '编辑角色' : '新建角色'}
      width={600}
      visible={visible}
      formRef={formRef}
      onFinish={async (values) => {
        try {
          if (record) {
            await updateRole(record.id, values);
          } else {
            await createRole(values);
          }
          message.success(`${record ? '修改' : '添加'}成功`);
          onSuccess();
          return true;
        } catch (error: any) {
          message.error(error.msg);
          return false;
        }
      }}
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
      <ProFormTreeSelect
        name="menu_ids"
        label="菜单权限"
        fieldProps={{
          treeData: menuTree,
          treeCheckable: true,
          showCheckedStrategy: 'SHOW_PARENT',
          placeholder: '请选择菜单权限',
          fieldNames: {
            label: 'name',
            value: 'id',
            children: 'children'
          }
        }}
        rules={[{ required: true, message: '请选择菜单权限' }]}
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
    </ModalForm>
  );
};

export default RoleForm; 