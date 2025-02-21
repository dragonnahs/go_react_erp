import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { getProject, updateTaskPosition } from '@/services/project';
import type { Project, TaskCard as TaskCardType, ProjectPhase } from '@/types/project';
import TaskCard from './components/TaskCard';
import TaskDetail from './components/TaskDetail';
import TimeAxis from './components/TimeAxis';
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

const ProjectTimeline: React.FC = () => {
  const [project, setProject] = useState<Project>();
  const [selectedTask, setSelectedTask] = useState<TaskCardType>();
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

  

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !project) return;

    const { source, destination } = result;
    const sourcePhase = source.droppableId as ProjectPhase;
    const destPhase = destination.droppableId as ProjectPhase;

    // 创建新的项目数据
    const newProject = { ...project };
    const [movedTask] = newProject.phases[sourcePhase].tasks.splice(source.index, 1);
    movedTask.phase = destPhase;
    newProject.phases[destPhase].tasks.splice(destination.index, 0, movedTask);

    // 更新状态
    setProject(newProject);

    // 调用后端API更新任务位置
    try {
      await updateTaskPosition({
        taskId: movedTask.id,
        newPhase: destPhase,
        newOrder: destination.index,
      });
    } catch (error) {
      message.error('更新任务位置失败');
      fetchProjectData(); // 重新获取数据
    }
  };

  return (
    <div className={styles.container}>
      <TimeAxis project={project} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.phasesContainer}>
          {project && Object.entries(project.phases).map(([phase, phaseData]) => (
            <div key={phase} className={styles.phaseColumn}>
              <h3>{getPhaseTitle(phase as ProjectPhase)}</h3>
              <Droppable droppableId={phase}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.taskList}
                  >
                    {phaseData.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
                )}
              </Droppable>
            </div>
          ))}
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