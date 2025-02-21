/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:54:42
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-21 15:13:46
 * @FilePath: \go_react_erp\backend\internal\repository\project.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"erp-sys/internal/model"
	"erp-sys/pkg/database"
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

// UpdateTaskPosition 更新任务位置
func (r *ProjectRepository) UpdateTaskPosition(taskID uint, phase model.Phase, order int) error {
	return database.DB.Model(&model.Task{}).
		Where("id = ?", taskID).
		Updates(map[string]interface{}{
			"phase": phase,
			"order": order,
		}).Error
}

// UpdateTaskStatus 更新任务状态
func (r *ProjectRepository) UpdateTaskStatus(taskID uint, status model.TaskStatus) error {
	return database.DB.Model(&model.Task{}).
		Where("id = ?", taskID).
		Update("status", status).Error
} 