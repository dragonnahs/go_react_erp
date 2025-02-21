// 任务状态
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'delayed';

// 项目阶段
export type ProjectPhase = 'preparation' | 'implementation' | 'execution' | 'completion' | 'acceptance';

// 任务卡片
export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO格式的日期字符串 "YYYY-MM-DD"
  endTime: string;
  phase: ProjectPhase;
  status: TaskStatus;
  order: number;
}

// 项目信息
export interface PhaseData {
  startDate: string;
  endDate: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  phases: {
    [key in ProjectPhase]: PhaseData;
  };
} 