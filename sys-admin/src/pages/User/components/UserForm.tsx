import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FormInstance, message } from 'antd';
import { createUser, updateUser } from '@/services/user';
import { getAllRoles } from '@/services/role';
import { useRef, useEffect, useState } from 'react';

interface UserFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record?: API.UserInfo;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  record,
}) => {
  const formRef = useRef<FormInstance>();
  const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await getAllRoles();
        const roleOptions = data.map((role: any) => ({
          label: role.name,
          value: role.id,
        }));
        setRoles(roleOptions);
      } catch (error) {
        message.error('获取角色列表失败');
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (record?.id) {
        await updateUser(Number(record.id), values);
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      onSuccess();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  return (
    <ModalForm
      title={record ? '编辑用户' : '新建用户'}
      open={visible}
      onOpenChange={(visible) => !visible && onCancel()}
      formRef={formRef}
      initialValues={record}
      onFinish={handleSubmit}
    >
      <ProFormText
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      />
      {!record && (
        <ProFormText.Password
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        />
      )}
      <ProFormText
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      />
      <ProFormSelect
        name="role_id"
        label="角色"
        rules={[{ required: true, message: '请选择角色' }]}
        options={roles}
      />
      <ProFormSelect
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
        options={[
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ]}
      />
    </ModalForm>
  );
};

export default UserForm; 