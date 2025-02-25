/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:54:48
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-25 15:11:09
 * @FilePath: \go_react_erp\backend\internal\service\project.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"erp-sys/internal/model"
	"erp-sys/internal/repository"
	"erp-sys/pkg/errno"
	"time"
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
func (s *ProjectService) UpdateTaskPosition(taskID uint, phase model.Phase, newStartDate time.Time) error {
	return s.projectRepo.UpdateTaskPosition(taskID, phase, newStartDate)
}

// UpdateTaskStatus 更新任务状态
func (s *ProjectService) UpdateTaskStatus(taskID uint, status model.TaskStatus) error {
	return s.projectRepo.UpdateTaskStatus(taskID, status)
}

// CreateTask 创建任务
func (s *ProjectService) CreateTask(task *model.Task) error {
	// 验证阶段是否有效
	if !isValidPhase(task.Phase) {
		return errno.ErrInvalidParam.WithMessage("无效的项目阶段")
	}

	// 验证状态是否有效
	if !isValidStatus(task.Status) {
		return errno.ErrInvalidParam.WithMessage("无效的任务状态")
	}

	// 创建任务
	if err := s.projectRepo.CreateTask(task); err != nil {
		return errno.ErrDatabase.WithDetails(err.Error())
	}

	return nil
}

// UpdateTask 更新任务
func (s *ProjectService) UpdateTask(task *model.Task) error {
	// 验证状态是否有效
	if task.Status != "" && !isValidStatus(task.Status) {
		return errno.ErrInvalidParam.WithMessage("无效的任务状态")
	}

	return s.projectRepo.UpdateTask(task)
}

// 辅助函数：验证阶段是否有效
func isValidPhase(phase model.Phase) bool {
	validPhases := []model.Phase{
		model.PhasePreparation,
		model.PhaseImplementation,
		model.PhaseExecution,
		model.PhaseCompletion,
		model.PhaseAcceptance,
	}
	for _, p := range validPhases {
		if p == phase {
			return true
		}
	}
	return false
}

// 辅助函数：验证状态是否有效
func isValidStatus(status model.TaskStatus) bool {
	validStatuses := []model.TaskStatus{
		model.TaskStatusPending,
		model.TaskStatusProcessing,
		model.TaskStatusCompleted,
	}
	for _, s := range validStatuses {
		if s == status {
			return true
		}
	}
	return false
} 