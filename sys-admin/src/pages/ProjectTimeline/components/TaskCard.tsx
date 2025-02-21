import React from 'react';
import { Tag, Tooltip } from 'antd';
import type { TaskCardType } from '@/types/project';
import styles from './TaskCard.less';

interface TaskCardProps {
  task: TaskCardType;
}

const statusColors = {
  pending: 'default',
  processing: 'processing',
  completed: 'success',
  delayed: 'error',
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Tooltip title={`${task.title} (${task.startTime} ~ ${task.endTime})`}>
      <div className={styles.taskCard}>
        <div className={styles.title}>{task.title}</div>
        <Tag color={statusColors[task.status]}>
          {task.status}
        </Tag>
      </div>
    </Tooltip>
  );
};

export default TaskCard; 