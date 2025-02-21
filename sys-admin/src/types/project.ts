// 任务状态
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'delayed';

// 项目阶段
export type ProjectPhase = 'preparation' | 'implementation' | 'execution' | 'completion' | 'acceptance';

// 任务卡片
export interface TaskCard {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  phase: ProjectPhase;
  status: TaskStatus;
  order: number;
}

// 项目信息
export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  phases: {
    [key in ProjectPhase]: {
      startDate: string;
      endDate: string;
      tasks: TaskCard[];
    };
  };
} 