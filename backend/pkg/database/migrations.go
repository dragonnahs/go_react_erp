package database

import (
	"erp-sys/internal/model"
	"log"
)

// RunMigrations 运行数据库迁移
func RunMigrations() {
	// 自动迁移数据库结构
	err := DB.AutoMigrate(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.RoleMenu{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 检查是否需要初始化基础数据
	var count int64
	DB.Model(&model.Role{}).Count(&count)
	if count == 0 {
		// 初始化角色
		adminRole := model.Role{
			Name:        "超级管理员",
			Code:        "admin",
			Description: "系统超级管理员",
			Status:      true,
			Sort:        0,
		}
		if err := DB.Create(&adminRole).Error; err != nil {
			log.Printf("Failed to create admin role: %v", err)
			return
		}

		userRole := model.Role{
			Name:        "普通用户",
			Code:        "user",
			Description: "普通用户",
			Status:      true,
			Sort:        1,
		}
		if err := DB.Create(&userRole).Error; err != nil {
			log.Printf("Failed to create user role: %v", err)
			return
		}

		// 更新现有用户的角色ID
		DB.Model(&model.User{}).Where("role_id = 0").Update("role_id", userRole.ID)
	}
} 