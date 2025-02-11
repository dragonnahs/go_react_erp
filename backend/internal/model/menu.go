package model

import (
	"time"

	"gorm.io/gorm"
)

type Menu struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	Name       string         `gorm:"size:50;not null" json:"name"`                // 菜单名称
	ParentID   uint          `gorm:"default:0" json:"parent_id"`                  // 父菜单ID
	Path       string         `gorm:"size:200" json:"path"`                       // 路由路径
	Component  string         `gorm:"size:255" json:"component"`                  // 组件路径
	Permission string         `gorm:"size:100" json:"permission"`                 // 权限标识
	Type       string         `gorm:"size:20;not null" json:"type"`              // 菜单类型（menu,button）
	Icon       string         `gorm:"size:50" json:"icon"`                       // 图标
	Sort       int           `gorm:"default:0" json:"sort"`                      // 排序
	Visible    bool          `gorm:"default:true" json:"visible"`               // 是否可见
	Status     string         `gorm:"size:20;default:'active'" json:"status"`    // 状态
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	Children   []*Menu        `gorm:"-" json:"children,omitempty"`               // 子菜单
}

// TableName 指定表名
func (Menu) TableName() string {
	return "sys_menu"
} 