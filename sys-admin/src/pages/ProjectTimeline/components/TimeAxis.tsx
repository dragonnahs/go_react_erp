/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:31:40
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-24 18:02:14
 * @FilePath: \go_react_erp\sys-admin\src\pages\ProjectTimeline\components\TimeAxis.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import dayjs from 'dayjs';
import type { Project } from '@/types/project';
import styles from './TimeAxis.less';

interface TimeAxisProps {
  project?: Project;
}

const TimeAxis: React.FC<TimeAxisProps> = ({ project }) => {
  if (!project) return null;

  const startDate = dayjs(project.startDate);
  const endDate = dayjs(project.endDate);
  const totalDays = endDate.diff(startDate, 'day');

  // 生成月份刻度
  const months = [];
  let currentDate = startDate.startOf('month');
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
    months.push({
      date: currentDate,
      position: (currentDate.diff(startDate, 'day') / totalDays) * 100,
      label: currentDate.format('YYYY年MM月'),
    });
    currentDate = currentDate.add(1, 'month');
  }

  return (
    <div className={styles.timeAxis}>
      <div className={styles.marks}>
        {months.map((mark, index) => (
          <div
            key={`month-${index}`}
            className={styles.mark}
            style={{ left: `${mark.position}%` }}
          >
            <div className={styles.markLine} />
            <span className={styles.markLabel}>{mark.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeAxis; 