import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { FormInstance, message } from 'antd';
import { createUser, updateUser } from '@/services/user';
import { useRef } from 'react';

interface UserFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record?: any;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  record,
}) => {
  const formRef = useRef<FormInstance>(null);
  if (record) {
    formRef.current?.setFieldsValue(record);
  }else{
    formRef.current?.resetFields();
  }
  return (
    <ModalForm
      title={record ? '编辑用户' : '新建用户'}
      width={500}
      visible={visible}
      formRef={formRef}
      onFinish={async (values) => {
        try {
          if (record) {
            await updateUser(record.id, values);
          } else {
            await createUser(values);
          }
          message.success(`${record ? '修改' : '添加'}成功`);
          onSuccess();
          return true;
        } catch (error: any) {
          message.error(error.msg);
          // 错误处理由请求拦截器统一处理
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
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' },
        ]}
      />
      <ProFormText
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' },
        ]}
      />
      {!record && (
        <ProFormText.Password
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        />
      )}
      <ProFormSelect
        name="role"
        label="角色"
        rules={[{ required: true, message: '请选择角色' }]}
        options={[
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
        ]}
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