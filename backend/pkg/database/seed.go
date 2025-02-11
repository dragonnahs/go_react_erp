package database

import (
	"erp-sys/internal/model"
	"log"
)

// SeedData 初始化基础数据
func SeedData() {
	// 检查是否已有菜单数据
	var count int64
	DB.Model(&model.Menu{}).Count(&count)
	if count == 0 {
		// 创建基础菜单
		menus := []model.Menu{
			{
				Name:       "系统管理",
				Path:       "/system",
				Component: "Layout",
				Permission: "system",
				Type:      "menu",
				Icon:      "SettingOutlined",
				Sort:      1,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "用户管理",
				Path:       "/user",
				Component: "/User",
				Permission: "system:user",
				Type:      "menu",
				Icon:      "UserOutlined",
				ParentID:  1, // 关联到系统管理
				Sort:      1,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "菜单管理",
				Path:       "/menu",
				Component: "/Menu",
				Permission: "system:menu",
				Type:      "menu",
				Icon:      "MenuOutlined",
				ParentID:  1, // 关联到系统管理
				Sort:      2,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "用户查询",
				Permission: "system:user:query",
				Type:      "button",
				ParentID:  2, // 关联到用户管理
				Sort:      1,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "用户新增",
				Permission: "system:user:add",
				Type:      "button",
				ParentID:  2, // 关联到用户管理
				Sort:      2,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "用户修改",
				Permission: "system:user:edit",
				Type:      "button",
				ParentID:  2, // 关联到用户管理
				Sort:      3,
				Visible:   true,
				Status:    "active",
			},
			{
				Name:       "用户删除",
				Permission: "system:user:delete",
				Type:      "button",
				ParentID:  2, // 关联到用户管理
				Sort:      4,
				Visible:   true,
				Status:    "active",
			},
		}

		// 批量创建菜单
		if err := DB.Create(&menus).Error; err != nil {
			log.Printf("Failed to seed menu data: %v", err)
		}
	}
} 