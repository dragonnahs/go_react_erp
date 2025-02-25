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
const TASK_SPACING = 20;

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

  // 修改计算任务布局的函数
  const calculateTaskLayout = (tasks: Task[]) => {
    const columns: Task[][] = [];
    
    // 按开始时间排序
    const sortedTasks = [...tasks].sort((a, b) => 
      dayjs(a.startTime).diff(dayjs(b.startTime))
    );

    sortedTasks.forEach(task => {
      const taskStart = dayjs(task.startTime);
      const taskEnd = dayjs(task.endTime);
      let columnIndex = 0;
      let placed = false;

      // 先检查是否有重叠的列
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const hasOverlap = column.some(existingTask => {
          const existingStart = dayjs(existingTask.startTime);
          const existingEnd = dayjs(existingTask.endTime);
          return !(taskEnd.isBefore(existingStart) || taskStart.isAfter(existingEnd));
        });

        if (hasOverlap) {
          columnIndex = i;
          placed = true;
          break;
        }
      }

      // 如果没有重叠，找到第一个可用的列
      if (!placed) {
        columnIndex = columns.length;
      }

      // 确保列存在
      if (!columns[columnIndex]) {
        columns[columnIndex] = [];
      }

      // 添加任务到列
      columns[columnIndex].push(task);
    });

    return columns;
  };

  // 添加箭头组件
  const TaskArrow: React.FC<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    direction: 'right' | 'down';
  }> = ({ from, to, direction }) => {
    const arrowStyle = direction === 'down' ? {
      height: to.y - from.y - TASK_HEIGHT,
      width: '2px',
      left: from.x + TASK_WIDTH / 2,
      top: from.y + TASK_HEIGHT,
    } : {
      width: to.x - from.x - TASK_WIDTH,
      height: '2px',
      left: from.x + TASK_WIDTH,
      top: from.y + TASK_HEIGHT / 2,
    };

    return (
      <div 
        className={`${styles.taskArrow} ${styles[direction]}`}
        style={arrowStyle}
      />
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
                {(() => {
                  const taskColumns = calculateTaskLayout(phaseTasks);
                  return (
                    <>
                      {/* 渲染任务 */}
                      {taskColumns.map((column, columnIndex) => (
                        <div 
                          key={columnIndex} 
                          className={styles.taskColumn}
                          style={{ 
                            position: 'absolute',
                            left: columnIndex * (TASK_WIDTH + TASK_SPACING),
                            top: 0,
                            height: '100%'
                          }}
                        >
                          {column.map((task, rowIndex) => (
                            <div 
                              key={task.id}
                              className={styles.taskItem}
                              style={{
                                width: TASK_WIDTH,
                                height: TASK_HEIGHT,
                                position: 'absolute',
                                top: rowIndex * (TASK_HEIGHT + TASK_SPACING)
                              }}
                            >
                              <TaskCard task={task} />
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* 渲染箭头 */}
                      {taskColumns.map((column, columnIndex) => 
                        column.map((task, rowIndex) => {
                          const arrows = [];
                          
                          // 向下连接
                          if (rowIndex < column.length - 1) {
                            arrows.push(
                              <TaskArrow
                                key={`down-${task.id}`}
                                from={{
                                  x: columnIndex * (TASK_WIDTH + TASK_SPACING),
                                  y: rowIndex * (TASK_HEIGHT + TASK_SPACING)
                                }}
                                to={{
                                  x: columnIndex * (TASK_WIDTH + TASK_SPACING),
                                  y: (rowIndex + 1) * (TASK_HEIGHT + TASK_SPACING)
                                }}
                                direction="down"
                              />
                            );
                          }

                          // 向右连接
                          if (columnIndex < taskColumns.length - 1) {
                            arrows.push(
                              <TaskArrow
                                key={`right-${task.id}`}
                                from={{
                                  x: columnIndex * (TASK_WIDTH + TASK_SPACING),
                                  y: rowIndex * (TASK_HEIGHT + TASK_SPACING)
                                }}
                                to={{
                                  x: (columnIndex + 1) * (TASK_WIDTH + TASK_SPACING),
                                  y: rowIndex * (TASK_HEIGHT + TASK_SPACING)
                                }}
                                direction="right"
                              />
                            );
                          }

                          return arrows;
                        })
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTimeline; 