import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getProject } from '@/services/project';
import type { Project, Task, ProjectPhase } from '@/types/project';
import TaskCard from './components/TaskCard';
import TaskDetail from './components/TaskDetail';
import styles from './index.less';

const getPhaseTitle = (phase: ProjectPhase) => {
  const titles = {
    preparation: '项目准备',
    implementation: '项目实施',
    execution: '项目执行',
    completion: '项目完工',
    acceptance: '项目验收'
  };
  return titles[phase];
};

const PHASE_HEIGHTS = {
  preparation: 80,    // 减小每个阶段的高度
  implementation: 80,
  execution: 80,
  completion: 80,
  acceptance: 80,
};

const ProjectTimeline: React.FC = () => {
  const [project, setProject] = useState<Project>();
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchProjectData = async () => {
    try {
      const response = await getProject();
      setProject(response.data as any);
    } catch (error) {
      message.error('获取项目数据失败');
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  if (!project) return null;

  const startDate = dayjs(project.startDate);
  const endDate = dayjs(project.endDate);
  const totalDays = endDate.diff(startDate, 'day');
  
  // 修改时间轴宽度计算，将每天宽度减少到7.5px
  const getTimelineWidth = () => {
    const days = endDate.diff(startDate, 'day');
    return Math.max(days * 7.5 + 160, window.innerWidth - 120); // 7.5px/天
  };

  // 修改月份标记的计算，每两个月显示一次
  const months = [];
  let currentDate = startDate.startOf('month');
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
    if (currentDate.month() % 2 === 0) { // 每两个月显示一次
      months.push({
        month: currentDate.format('YY/MM'),
        left: (currentDate.diff(startDate, 'day') / totalDays) * 100
      });
    }
    currentDate = currentDate.add(1, 'month');
  }

  // 计算任务位置
  const getTaskPosition = (task: Task) => {
    const taskStart = dayjs(task.startTime);
    const taskEnd = dayjs(task.endTime);
    const left = (taskStart.diff(startDate, 'day') / totalDays) * 100;
    const width = Math.max(
      (taskEnd.diff(taskStart, 'day') / totalDays) * 100,
      2 // 最小宽度百分比
    );
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className={styles.container}>
      <div className={styles.timelineWrapper}>
        {/* 固定的阶段标签列 */}
        <div className={styles.phaseLabels}>
          <div className={styles.headerPlaceholder} />
          {Object.entries(project.phases).map(([phase]) => (
            <div key={phase} className={styles.phaseLabel}>
              {getPhaseTitle(phase as ProjectPhase)}
            </div>
          ))}
        </div>

        {/* 可滚动的内容区域 */}
        <div className={styles.scrollContainer}>
          {/* 时间轴标尺 */}
          <div className={styles.timelineHeader} style={{ width: getTimelineWidth() }}>
            <div className={styles.monthMarkers}>
              {months.map(({ month, left }) => (
                <div
                  key={month}
                  className={styles.monthMarker}
                  style={{ left: `${left}%` }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* 任务区域 */}
          <div className={styles.timelineContent} style={{ width: getTimelineWidth() }}>
            {Object.entries(project.phases).map(([phase, phaseData]) => (
              <div
                key={phase}
                className={styles.phaseRow}
                style={{ height: PHASE_HEIGHTS[phase as ProjectPhase] }}
              >
                <div className={styles.phaseTasks}>
                  {phaseData.tasks.map(task => (
                    <div
                      key={task.id}
                      className={styles.taskItem}
                      style={{
                        ...getTaskPosition(task),
                        marginLeft: '40px', // 为任务添加左边距
                      }}
                      onClick={() => {
                        setSelectedTask(task);
                        setDetailVisible(true);
                      }}
                    >
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskDetail
        visible={detailVisible}
        task={selectedTask}
        onClose={() => setDetailVisible(false)}
        onSuccess={() => {
          setDetailVisible(false);
          fetchProjectData();
        }}
      />
    </div>
  );
};

export default ProjectTimeline; 