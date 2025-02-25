import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getProject } from '@/services/project';
import type { Project, Task, ProjectPhase } from '@/types/project';
import TaskCard from './components/TaskCard';
import styles from './index.less';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

const PHASE_TITLES = {
  preparation: '项目准备',
  implementation: '项目实施',
  execution: '项目执行',
  completion: '项目完工',
  acceptance: '项目验收'
} as const;

const TASK_WIDTH = 160;
const TASK_HEIGHT = 80;
const TASK_MARGIN = 10;

type PhaseKey = keyof typeof PHASE_TITLES;

const ProjectTimeline: React.FC = () => {
  const [project, setProject] = useState<Project>();

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

  // 计算阶段的宽度
  const getPhaseWidth = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return TASK_WIDTH * 2;

    const startTimes = tasks.map(task => dayjs(task.startTime));
    const endTimes = tasks.map(task => dayjs(task.endTime));
    
    const phaseStart = startTimes.reduce((min, curr) => 
      curr.isBefore(min) ? curr : min, startTimes[0]
    );
    const phaseEnd = endTimes.reduce((max, curr) => 
      curr.isAfter(max) ? curr : max, endTimes[0]
    );
    
    return Math.max(
      phaseEnd.diff(phaseStart, 'day') * 5 + TASK_WIDTH,
      TASK_WIDTH * 2
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {Object.entries(PHASE_TITLES).map(([phase]) => {
          const phaseKey = phase as PhaseKey;
          const phaseTasks = project.phases[phaseKey]?.tasks || [];
          const width = getPhaseWidth(phaseTasks);
          
          return (
            <div 
              key={phase}
              className={styles.phaseColumn}
              style={{ width }}
            >
              <div className={styles.phaseHeader}>
                {PHASE_TITLES[phaseKey]}
              </div>
              <div className={styles.phaseContent}>
                {phaseTasks.map((task, index) => (
                  <div 
                    key={task.id}
                    className={styles.taskItem}
                    style={{
                      width: TASK_WIDTH,
                      height: TASK_HEIGHT,
                      marginBottom: TASK_MARGIN
                    }}
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline; 