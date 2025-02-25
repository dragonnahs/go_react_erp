import React from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import type { Task } from '@/types/project';
import dayjs from 'dayjs';

interface TaskEditModalProps {
  visible: boolean;
  task: Task | null;
  onOk: (values: any) => void;
  onCancel: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  task,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="编辑任务"
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={task ? {
          ...task,
          startTime: dayjs(task.startTime),
          endTime: dayjs(task.endTime),
        } : {}}
        onFinish={onOk}
      >
        <Form.Item
          name="title"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="startTime"
          label="开始时间"
          rules={[{ required: true, message: '请选择开始时间' }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[{ required: true, message: '请选择结束时间' }]}
        >
          <DatePicker showTime />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select>
            <Select.Option value="pending">待处理</Select.Option>
            <Select.Option value="processing">进行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskEditModal; 