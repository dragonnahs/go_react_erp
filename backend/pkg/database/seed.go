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


func InitRoles() {
	var count int64
	DB.Model(&model.Role{}).Count(&count)
	if count > 0 {
		return
	}

	// 创建超级管理员角色
	adminRole := model.Role{
		Name:        "超级管理员",
		Code:        "admin",
		Description: "系统超级管理员，拥有所有权限",
		Status:      true,
		Sort:        0,
	}
	if err := DB.Create(&adminRole).Error; err != nil {
		log.Printf("Failed to create admin role: %v", err)
		return
	}

	// 获取所有菜单ID
	var menuIDs []uint
	if err := DB.Model(&model.Menu{}).Pluck("id", &menuIDs).Error; err != nil {
		log.Printf("Failed to get menu ids: %v", err)
		return
	}

	// 为超级管理员分配所有菜单权限
	roleMenus := make([]model.RoleMenu, 0, len(menuIDs))
	for _, menuID := range menuIDs {
		roleMenus = append(roleMenus, model.RoleMenu{
			RoleID: adminRole.ID,
			MenuID: menuID,
		})
	}
	if err := DB.Create(&roleMenus).Error; err != nil {
		log.Printf("Failed to create role-menu relations: %v", err)
		return
	}

	// 创建普通用户角色
	userRole := model.Role{
		Name:        "普通用户",
		Code:        "user",
		Description: "普通用户，拥有基本操作权限",
		Status:      true,
		Sort:        1,
	}
	if err := DB.Create(&userRole).Error; err != nil {
		log.Printf("Failed to create user role: %v", err)
		return
	}

	// 为普通用户分配基本菜单权限（这里假设ID为1的是首页菜单）
	basicMenus := []model.RoleMenu{
		{RoleID: userRole.ID, MenuID: 1}, // 首页
	}
	if err := DB.Create(&basicMenus).Error; err != nil {
		log.Printf("Failed to create basic role-menu relations: %v", err)
		return
	}

	log.Println("Roles initialized successfully")
} 