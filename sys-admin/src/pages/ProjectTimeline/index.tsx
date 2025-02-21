import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { getProject, updateTaskPosition } from '@/services/project';
import type { Project, Task, ProjectPhase } from '@/types/project';
import TaskCard from './components/TaskCard';
import TaskDetail from './components/TaskDetail';
import styles from './index.less';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

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
  preparation: 70,    // 减小每个阶段的高度
  implementation: 70,
  execution: 70,
  completion: 70,
  acceptance: 70,
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
  const getTaskPosition = (task: Task, phaseData: any) => {
    const { taskRows } = calculatePhaseRows(phaseData.tasks);
    const row = taskRows[task.id.toString()];
    const TASK_HEIGHT = 44; // 任务卡片高度
    const TASK_MARGIN = 8; // 任务卡片间距

    const taskStart = dayjs(task.startTime);
    const taskEnd = dayjs(task.endTime);
    const left = (taskStart.diff(startDate, 'day') / totalDays) * 100;
    const width = Math.max(
      (taskEnd.diff(taskStart, 'day') / totalDays) * 100,
      2
    );

    return {
      left: `${left}%`,
      width: `${width}%`,
      top: row * (TASK_HEIGHT + TASK_MARGIN) + 'px'
    };
  };

  // 计算阶段高度
  const getPhaseHeight = (phaseData: any) => {
    const { rowCount } = calculatePhaseRows(phaseData.tasks);
    const TASK_HEIGHT = 44; // 任务卡片高度
    const TASK_MARGIN = 8; // 任务卡片间距
    const MIN_HEIGHT = 60; // 最小高度
    
    return Math.max(rowCount * (TASK_HEIGHT + TASK_MARGIN) + TASK_MARGIN * 2, MIN_HEIGHT);
  };

  // 处理拖拽结束事件
  const handleDragEnd = async (result: any) => {
    if (!result.destination || !project) return;

    const { draggableId, destination } = result;
    const taskId = parseInt(draggableId);
    const newPhase = destination.droppableId as ProjectPhase;
    const newOrder = destination.index;

    try {
      await updateTaskPosition({
        taskId,
        newPhase,
        newOrder,
      });
      message.success('更新任务位置成功');
      fetchProjectData();
    } catch (error) {
      message.error('更新任务位置失败');
    }
  };

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={handleDragEnd}>
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