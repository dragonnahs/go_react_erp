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
  const monthsDiff = endDate.diff(startDate, 'month');

  const months = Array.from({ length: monthsDiff + 1 }, (_, i) => {
    const currentMonth = startDate.add(i, 'month');
    return {
      year: currentMonth.year(),
      month: currentMonth.format('MM'),
      isYearStart: currentMonth.month() === 0,
    };
  });

  return (
    <div className={styles.timeAxis}>
      <div className={styles.yearMarks}>
        {months.map((item, index) => (
          item.isYearStart && (
            <div
              key={`year-${index}`}
              className={styles.yearMark}
              style={{ left: `${(index / months.length) * 100}%` }}
            >
              {item.year}
            </div>
          )
        ))}
      </div>
      <div className={styles.monthMarks}>
        {months.map((item, index) => (
          <div
            key={`month-${index}`}
            className={styles.monthMark}
            style={{ left: `${(index / months.length) * 100}%` }}
          >
            {item.month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeAxis; 