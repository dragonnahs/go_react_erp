package service

import (
	"erp-sys/internal/model"
	"erp-sys/internal/repository"
)

type ProjectService struct {
	projectRepo *repository.ProjectRepository
}

func NewProjectService() *ProjectService {
	return &ProjectService{
		projectRepo: repository.NewProjectRepository(),
	}
}

// GetCurrentProject 获取当前项目
func (s *ProjectService) GetCurrentProject() (*model.Project, error) {
	return s.projectRepo.GetCurrentProject()
}

// UpdateTaskPosition 更新任务位置
func (s *ProjectService) UpdateTaskPosition(taskID uint, phase model.Phase, order int) error {
	return s.projectRepo.UpdateTaskPosition(taskID, phase, order)
}

// UpdateTaskStatus 更新任务状态
func (s *ProjectService) UpdateTaskStatus(taskID uint, status model.TaskStatus) error {
	return s.projectRepo.UpdateTaskStatus(taskID, status)
} 