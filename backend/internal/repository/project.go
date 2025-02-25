/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:54:42
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-24 17:48:33
 * @FilePath: \go_react_erp\backend\internal\repository\project.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"erp-sys/internal/model"
	"erp-sys/pkg/database"
	"time"
)

type ProjectRepository struct{}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{}
}

// GetCurrentProject 获取当前项目
func (r *ProjectRepository) GetCurrentProject() (*model.Project, error) {
	var project model.Project
	err := database.DB.Preload("Tasks").First(&project).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// UpdateTaskPosition 更新任务位置和开始时间
func (r *ProjectRepository) UpdateTaskPosition(taskID uint, phase model.Phase, newStartDate time.Time) error {
	// 先获取原任务信息
	var task model.Task
	if err := database.DB.First(&task, taskID).Error; err != nil {
		return err
	}
	
	// 计算任务持续时间
	duration := task.EndTime.Sub(task.StartTime)
	
	// 只更新需要修改的字段
	updates := map[string]interface{}{
		"start_time": newStartDate,
		"end_time":   newStartDate.Add(duration),
		"phase":      phase,
	}
	
	// 使用 Updates 方法只更新指定字段
	return database.DB.Model(&task).Updates(updates).Error
}

// UpdateTaskStatus 更新任务状态
func (r *ProjectRepository) UpdateTaskStatus(taskID uint, status model.TaskStatus) error {
	return database.DB.Model(&model.Task{}).
		Where("id = ?", taskID).
		Update("status", status).Error
}

// CreateTask 创建任务
func (r *ProjectRepository) CreateTask(task *model.Task) error {
	return database.DB.Create(task).Error
} 