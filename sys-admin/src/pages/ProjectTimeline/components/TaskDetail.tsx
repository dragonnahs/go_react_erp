import React from 'react';
import { Modal, Descriptions, Button, Space } from 'antd';
import type { TaskCard } from '@/types/project';
import { updateTaskStatus } from '@/services/project';

interface TaskDetailProps {
  visible: boolean;
  task?: TaskCard;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  visible,
  task,
  onClose,
  onSuccess,
}) => {
  const handleStatusChange = async (newStatus: TaskCard['status']) => {
    if (!task) return;
    
    try {
      await updateTaskStatus(task.id, newStatus);
      onSuccess();
    } catch (error) {
      message.error('更新任务状态失败');
    }
  };

  return (
    <Modal
      title="任务详情"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Space key="operations">
          <Button 
            onClick={() => handleStatusChange('processing')}
            type="primary"
          >
            开始
          </Button>
          <Button 
            onClick={() => handleStatusChange('completed')}
            type="primary"
          >
            完成
          </Button>
        </Space>
      ]}
    >
      {task && (
        <Descriptions column={1}>
          <Descriptions.Item label="任务名称">{task.title}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{task.startTime}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{task.endTime}</Descriptions.Item>
          <Descriptions.Item label="当前状态">{task.status}</Descriptions.Item>
          <Descriptions.Item label="描述">{task.description}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

export default TaskDetail; 