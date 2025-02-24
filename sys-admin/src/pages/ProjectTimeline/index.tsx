import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getProject, updateTaskPosition } from '@/services/project';
import type { Project, Task, ProjectPhase } from '@/types/project';
import TaskCard from './components/TaskCard';
import TaskDetail from './components/TaskDetail';
import styles from './index.less';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import TimeAxis from './components/TimeAxis';
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

interface DraggingTask {
  id: string;
  position: { x: number; y: number };
}

const ProjectTimeline: React.FC = () => {
  const [project, setProject] = useState<Project>();
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [draggingTask, setDraggingTask] = useState<DraggingTask | null>(null);

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

  // 计算每个阶段的任务行数
  const calculatePhaseRows = (tasks: Task[]) => {
    const rows: { [key: string]: number } = {};
    const taskPositions: { [key: string]: number } = {};

    // 按开始时间排序任务
    const sortedTasks = [...tasks].sort((a, b) => 
      dayjs(a.startTime).diff(dayjs(b.startTime))
    );

    sortedTasks.forEach(task => {
      const taskStart = dayjs(task.startTime);
      const taskEnd = dayjs(task.endTime);
      let row = 0;

      // 查找可用的行
      while (true) {
        let canUseRow = true;
        // 检查这一行是否有重叠的任务
        for (const [tid, existingRow] of Object.entries(taskPositions)) {
          if (existingRow === row) {
            const existingTask = tasks.find(t => t.id.toString() === tid);
            if (existingTask) {
              const existingStart = dayjs(existingTask.startTime);
              const existingEnd = dayjs(existingTask.endTime);
              // 检查是否有时间重叠
              if (!(taskStart.isAfter(existingEnd) || taskEnd.isBefore(existingStart))) {
                canUseRow = false;
                break;
              }
            }
          }
        }
        if (canUseRow) break;
        row++;
      }

      taskPositions[task.id.toString()] = row;
      rows[task.id.toString()] = row;
    });

    return {
      rowCount: Math.max(...Object.values(rows)) + 1,
      taskRows: rows
    };
  };

  // 计算任务位置（包括垂直位置）
  const getTaskPosition = (task: Task, phaseData: any): React.CSSProperties => {
    // 如果任务正在拖拽中，使用拖拽位置
    if (draggingTask && draggingTask.id === task.id.toString()) {
      return {
        left: draggingTask.position.x + 'px',
        top: draggingTask.position.y + 'px',
        width: `${Math.max((dayjs(task.endTime).diff(dayjs(task.startTime), 'day') / totalDays) * 100, 2)}%`,
        position: 'absolute',
      } as React.CSSProperties;
    }

    // 常规位置计算保持不变
    const { taskRows } = calculatePhaseRows(phaseData.tasks);
    const row = taskRows[task.id.toString()];
    const TASK_HEIGHT = 44;
    const TASK_MARGIN = 8;

    const taskStart = dayjs(task.startTime);
    const taskEnd = dayjs(task.endTime);
    const left = (taskStart.diff(startDate, 'day') / totalDays) * 100;
    const width = Math.max((taskEnd.diff(taskStart, 'day') / totalDays) * 100, 2);

    return {
      position: 'absolute',
      left: `${left}%`,
      top: row * (TASK_HEIGHT + TASK_MARGIN) + 'px',
      width: `${width}%`,
    } as React.CSSProperties;
  };

  // 计算阶段高度
  const getPhaseHeight = (phaseData: any) => {
    const { rowCount } = calculatePhaseRows(phaseData.tasks);
    const TASK_HEIGHT = 44; // 任务卡片高度
    const TASK_MARGIN = 8; // 任务卡片间距
    const MIN_HEIGHT = 60; // 最小高度
    
    return Math.max(rowCount * (TASK_HEIGHT + TASK_MARGIN) + TASK_MARGIN * 2, MIN_HEIGHT);
  };

  // 处理拖拽中的位置更新
  const handleDragUpdate = (update: any) => {
    if (!update.destination || !update.draggableId) return;

    const scrollContainer = document.querySelector(`.${styles.scrollContainer}`);
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const x = update.destination.x - containerRect.left + scrollContainer.scrollLeft;
    const y = update.destination.y - containerRect.top;

    setDraggingTask({
      id: update.draggableId,
      position: { x, y },
    });
  };
   // 添加 findTask 辅助函数
  const findTask = (taskId: string): Task | undefined => {
    if (!project) return undefined;
    for (const phase of Object.values(project.phases)) {
      const task = phase.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  // 处理拖拽结束
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !project) return;
    setDraggingTask(null);

    const taskId = result.draggableId;
    const newPhase = result.destination.droppableId as ProjectPhase;
    
    const scrollContainer = document.querySelector(`.${styles.scrollContainer}`);
    if (!scrollContainer) return;

    try {
      const totalWidth = scrollContainer.scrollWidth;
      const dropX = (result.destination as any).x || 0;
      const scrollLeft = scrollContainer.scrollLeft;
      const absoluteX = dropX + scrollLeft;
      
      // 计算相对位置百分比
      const percentage = absoluteX / totalWidth;
      
      // 计算新的开始日期
      const startDate = dayjs(project.startDate);
      const endDate = dayjs(project.endDate);
      const totalMonths = endDate.diff(startDate, 'month');
      const monthsFromStart = Math.round(percentage * totalMonths);
      const newStartDate = startDate.add(monthsFromStart, 'month');

      if (newStartDate.isAfter(endDate)) {
        message.warning('任务不能超出项目结束时间');
        return;
      }

      await updateTaskPosition({
        taskId: parseInt(taskId),
        newPhase,
        newStartDate: newStartDate.format('YYYY-MM-DD'),
      });

      message.success('更新任务位置成功');
      fetchProjectData();
    } catch (error) {
      message.error('更新任务位置失败');
      console.error('Error updating task position:', error);
    }
  };

 

  return (
    <div className={styles.container}>
      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragUpdate={handleDragUpdate}
      >
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
                {/* {months.map(({ month, left }) => (
                  <div
                    key={month}
                    className={styles.monthMarker}
                    style={{ left: `${left}%` }}
                  >
                    {month}
                  </div>
                ))} */}
                <TimeAxis project={project} />
              </div>
            </div>

            {/* 任务区域 */}
            <div className={styles.timelineContent} style={{ width: getTimelineWidth() }}>
              {Object.entries(project.phases).map(([phase, phaseData]) => (
                <Droppable
                  key={phase}
                  droppableId={phase}
                  direction="horizontal"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={styles.phaseRow}
                      style={{ height: getPhaseHeight(phaseData) }}
                    >
                      <div className={styles.phaseTasks}>
                        {phaseData.tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${styles.taskItem} ${snapshot.isDragging ? styles.dragging : ''}`}
                                style={{
                                  ...getTaskPosition(task, phaseData),
                                  marginLeft: '40px',
                                  ...provided.draggableProps.style,
                                }}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setDetailVisible(true);
                                }}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>

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