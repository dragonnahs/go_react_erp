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

interface DraggingTask {
  id: string;
  position: { x: number; y: number };
}

const ProjectTimeline: React.FC = () => {
  const [project, setProject] = useState<Project>();
  const [draggingTask, setDraggingTask] = useState<DraggingTask | null>(null);
  const [dragTime, setDragTime] = useState<string | null>(null);

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

  const getTimelineWidth = () => {
    const days = endDate.diff(startDate, 'day');
    return Math.max(days * 5, window.innerWidth - 40); // 从10px/天改为5px/天
  };

  // 计算任务位置
  const getTaskPosition = (task: Task): React.CSSProperties => {
    if (draggingTask && draggingTask.id === task.id.toString()) {
      return {
        left: draggingTask.position.x + 'px',
        top: draggingTask.position.y + 'px',
        width: `${Math.max((dayjs(task.endTime).diff(dayjs(task.startTime), 'day') / totalDays) * 100, 2)}%`,
        position: 'absolute',
      } as React.CSSProperties;
    }

    const taskStart = dayjs(task.startTime);
    const taskEnd = dayjs(task.endTime);
    const left = (taskStart.diff(startDate, 'day') / totalDays) * 100;
    const width = Math.max((taskEnd.diff(taskStart, 'day') / totalDays) * 100, 2);

    return {
      position: 'absolute',
      left: `${left}%`,
      width: `${width}%`,
    } as React.CSSProperties;
  };

  // 处理拖拽更新
  const handleDragUpdate = (update: any) => {
    if (!update.destination || !project) return;
    console.log(update, 'update');
    const scrollContainer = document.querySelector(`.${styles.scrollContainer}`);
    if (!scrollContainer) return;

    // 获取拖拽元素的位置
    const dragElement = document.querySelector(`[data-rbd-draggable-id="${update.draggableId}"]`);
    if (!dragElement) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const dragRect = dragElement.getBoundingClientRect();
    
    // 计算相对位置
    const x = dragRect.left - containerRect.left + scrollContainer.scrollLeft;
    const y = dragRect.top - containerRect.top;

    // 计算拖拽位置对应的时间
    const totalWidth = scrollContainer.scrollWidth;
    const percentage = Math.max(0, Math.min(1, x / totalWidth));
    
    const startDate = dayjs(project.startDate);
    const endDate = dayjs(project.endDate);
    const totalDays = endDate.diff(startDate, 'day');
    const daysFromStart = Math.round(percentage * totalDays);
    
    try {
      const currentDate = startDate.add(daysFromStart, 'day');
      console.log(currentDate, 'currentDate');
      if (currentDate.isValid()) {
        setDragTime(currentDate.format('YYYY年MM月DD日'));
        setDraggingTask({
          id: update.draggableId,
          position: { x, y },
        });
      }
    } catch (error) {
      console.error('Date calculation error:', error);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = async (result: DropResult) => {
    setDragTime(null);
    if (!result.destination || !project) return;
    setDraggingTask(null);

    const taskId = result.draggableId;
    const newPhase = result.destination.droppableId as ProjectPhase;
    
    const scrollContainer = document.querySelector(`.${styles.scrollContainer}`);
    if (!scrollContainer) return;

    try {
      // 使用拖放结果中的位置信息
      const destinationX = (result.destination as any).x || 0;
      const scrollLeft = scrollContainer.scrollLeft;
      const containerRect = scrollContainer.getBoundingClientRect();
      
      // 计算最终位置
      const absoluteX = destinationX + scrollLeft - containerRect.left;
      const totalWidth = scrollContainer.scrollWidth;
      
      // 计算相对位置百分比
      const percentage = Math.max(0, Math.min(1, absoluteX / totalWidth));
      
      // 计算新的开始日期
      const startDate = dayjs(project.startDate);
      const endDate = dayjs(project.endDate);
      const totalDays = endDate.diff(startDate, 'day');
      const daysFromStart = Math.round(percentage * totalDays);
      const newStartDate = startDate.add(daysFromStart, 'day');

      if (!newStartDate.isValid() || newStartDate.isAfter(endDate)) {
        message.warning('无效的日期或超出项目结束时间');
        return;
      }

      // 更新前端状态
      const updatedProject = { ...project };
      const task = updatedProject.phases[newPhase].tasks.find(t => t.id === taskId);
      if (task) {
        // 从原阶段移除任务
        updatedProject.phases[newPhase].tasks = updatedProject.phases[newPhase].tasks.filter(t => t.id !== taskId);

        // 更新任务信息
        const taskDuration = dayjs(task.endTime).diff(dayjs(task.startTime), 'day');
        const updatedTask = {
          ...task,
          phase: newPhase,
          startTime: newStartDate.format('YYYY-MM-DD'),
          endTime: newStartDate.add(taskDuration, 'day').format('YYYY-MM-DD'),
        };

        // 添加到新阶段
        updatedProject.phases[newPhase].tasks.push(updatedTask);
        setProject(updatedProject);
      }

    } catch (error) {
      message.error('移动任务失败');
      console.error('Error moving task:', error);
    }
  };

  return (
    <div className={styles.container}>
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragUpdate={handleDragUpdate}
        onDragStart={() => {
          setDragTime(null);
          setDraggingTask(null);
        }}
      >
        <div className={styles.timeline}>
          {/* 时间轴和阶段分隔线 */}
          <div className={styles.timelineHeader} style={{ width: getTimelineWidth() }}>
            {/* 阶段标记 */}
            <div className={styles.phaseMarkers}>
              {Object.entries(PHASE_TITLES).map(([phase, title], index, array) => {
                const leftPosition = (index / (array.length - 1)) * 100;
                const rightPosition = ((index + 1) / (array.length - 1)) * 100;
                const width = rightPosition - leftPosition;
                
                return (
                  <div
                    key={phase}
                    className={styles.phaseSection}
                    style={{
                      left: `${leftPosition}%`,
                      width: `${width}%`,
                    }}
                  >
                    <div className={styles.phaseTitle}>{title}</div>
                    <div className={styles.phaseLine} />
                  </div>
                );
              })}
            </div>
            
            {/* 时间轴刻度 */}
            <div className={styles.timeMarkers}>
              {(() => {
                const months = [];
                let currentDate = startDate.startOf('month');
                
                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'month')) {
                  const position = (currentDate.diff(startDate, 'day') / totalDays) * 100;
                  months.push({
                    date: currentDate,
                    position,
                  });
                  currentDate = currentDate.add(1, 'month');
                }

                return months.map((month, index) => (
                  <div
                    key={index}
                    className={styles.timeMarker}
                    style={{ left: `${month.position}%` }}
                  >
                    {month.date.format('YYYY年MM月')}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* 拖拽时间指示器 */}
          {dragTime && draggingTask && (
            <div 
              className={styles.dragTimeIndicator}
              style={{ 
                left: draggingTask.position.x,
                top: draggingTask.position.y - 25 
              }}
            >
              {dragTime}
            </div>
          )}

          {/* 任务区域 */}
          <Droppable droppableId="timeline" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={styles.tasksContainer}
                style={{ width: getTimelineWidth() }}
              >
                {Object.values(project.phases).flatMap(phase =>
                  phase.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getTaskPosition(task)}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectTimeline; 