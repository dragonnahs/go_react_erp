/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-21 14:54:39
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-21 14:55:39
 * @FilePath: \go_react_erp\backend\internal\model\project.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package model

import (
	"time"

	"gorm.io/gorm"
)

// 项目阶段
type Phase string

const (
	PhasePreparation    Phase = "preparation"    // 准备阶段
	PhaseImplementation Phase = "implementation" // 实施阶段
	PhaseExecution      Phase = "execution"      // 执行阶段
	PhaseCompletion     Phase = "completion"     // 完工阶段
	PhaseAcceptance     Phase = "acceptance"     // 验收阶段
)

// 任务状态
type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "pending"    // 待处理
	TaskStatusProcessing TaskStatus = "processing" // 进行中
	TaskStatusCompleted  TaskStatus = "completed"  // 已完成
	TaskStatusDelayed    TaskStatus = "delayed"    // 延期
)

// Project 项目模型
type Project struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
	Status      string         `gorm:"size:20;not null" json:"status"`
	CreatedBy   uint           `json:"created_by"`
	Tasks       []Task         `json:"tasks,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Task 任务模型
type Task struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	ProjectID   uint           `json:"project_id"`
	Title       string         `gorm:"size:100;not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	StartTime   time.Time      `json:"start_time"`
	EndTime     time.Time      `json:"end_time"`
	Phase       Phase          `gorm:"size:20;not null" json:"phase"`
	Status      TaskStatus     `gorm:"size:20;not null" json:"status"`
	Order       int            `gorm:"default:0" json:"order"`
	CreatedBy   uint           `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
} 