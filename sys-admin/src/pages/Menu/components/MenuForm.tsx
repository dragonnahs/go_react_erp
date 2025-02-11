import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { FormInstance, message } from 'antd';
import { createMenu, updateMenu } from '@/services/menu';
import { useRef, useEffect } from 'react';
import React from 'react';
import IconSelect from '@/components/IconSelect';

interface MenuFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record?: any;
  menuTree?: any[];
}

const MenuForm: React.FC<MenuFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  record,
  menuTree,
}) => {
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    if (visible) {
      if (record) {
        formRef.current?.setFieldsValue(record);
      } else {
        formRef.current?.resetFields();
      }
    }
  }, [visible, record]);

  return (
    <ModalForm
      title={record ? '编辑菜单' : '新建菜单'}
      width={600}
      visible={visible}
      formRef={formRef}
      onFinish={async (values) => {
        try {
          if (record) {
            await updateMenu(record.id, values);
          } else {
            await createMenu(values);
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
      <ProFormTreeSelect
        name="parent_id"
        label="上级菜单"
        initialValue={0}
        fieldProps={{
          treeData: menuTree,
          placeholder: '请选择上级菜单',
          allowClear: true,
          fieldNames: {
            label: 'name',
            value: 'id',
            children: 'children'
          }
        }}
      />
      <ProFormText
        name="name"
        label="菜单名称"
        rules={[{ required: true, message: '请输入菜单名称' }]}
      />
      <ProFormSelect
        name="type"
        label="菜单类型"
        rules={[{ required: true, message: '请选择菜单类型' }]}
        options={[
          { label: '菜单', value: 'menu' },
          { label: '按钮', value: 'button' },
        ]}
      />
      <ProFormText
        name="path"
        label="路由路径"
        rules={[{ required: true, message: '请输入路由路径' }]}
      />
      <ProFormText
        name="component"
        label="组件路径"
      />
      <IconSelect
        name="icon"
        label="图标"
      />
      <ProFormText
        name="permission"
        label="权限标识"
        rules={[{ required: true, message: '请输入权限标识' }]}
      />
      <ProFormSwitch
        name="visible"
        label="菜单显示"
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

export default MenuForm; 