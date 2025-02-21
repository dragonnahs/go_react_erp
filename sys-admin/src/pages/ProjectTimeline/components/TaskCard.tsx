import React from 'react';
import { Card, Tag } from 'antd';
import type { TaskCard as TaskCardType } from '@/types/project';
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
    <Card className={styles.taskCard} size="small">
      <div className={styles.title}>{task.title}</div>
      <div className={styles.dates}>
        {task.startTime} ~ {task.endTime}
      </div>
      <Tag color={statusColors[task.status]}>
        {task.status}
      </Tag>
    </Card>
  );
};

export default TaskCard; 