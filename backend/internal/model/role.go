/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-11 15:34:40
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-11 16:43:53
 * @FilePath: \go_react_erp\backend\internal\model\role.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package model

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	Name        string `gorm:"type:varchar(50);not null;unique" json:"name"`        // 角色名称
	Code        string `gorm:"type:varchar(50);not null;unique" json:"code"`        // 角色编码
	Description string `gorm:"type:varchar(200)" json:"description"`                // 角色描述
	Status      bool   `gorm:"default:true" json:"status"`                         // 状态（启用/禁用）
	Sort        int    `gorm:"default:0" json:"sort"`                              // 排序
	MenuIDs     []uint `gorm:"-" json:"menu_ids,omitempty"`   
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`  
	ID         uint           `gorm:"primarykey" json:"id"`                   // 菜单ID列表（用于接收前端数据）
}

// RoleMenu 角色-菜单关联表
type RoleMenu struct {
	RoleID uint `gorm:"primaryKey"`
	MenuID uint `gorm:"primaryKey"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`  
} 