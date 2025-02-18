package repository

import (
	"erp-sys/internal/model"
	"erp-sys/pkg/database"
	"fmt"

	"gorm.io/gorm"
)

type RoleRepository struct{}

func NewRoleRepository() *RoleRepository {
	return &RoleRepository{}
}

// FindAll 获取角色列表（支持分页和搜索）
func (r *RoleRepository) FindAll(page, pageSize int, name string) ([]model.Role, int64, error) {
	var roles []model.Role
	var total int64
	query := database.DB.Model(&model.Role{})

	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Order("sort asc").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&roles).Error

	if err != nil {
		return nil, 0, err
	}

	// 获取每个角色的菜单ID
	for i := range roles {
		var menuIDs []uint
		err := database.DB.Model(&model.RoleMenu{}).
			Where("role_id = ?", roles[i].ID).
			Pluck("menu_id", &menuIDs).Error
		if err != nil {
			return nil, 0, err
		}
		roles[i].MenuIDs = menuIDs
	}

	return roles, total, nil
}

// Create 创建角色
func (r *RoleRepository) Create(role *model.Role) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 创建角色
		if err := tx.Create(role).Error; err != nil {
			return err
		}

		// 创建角色-菜单关联
		if len(role.MenuIDs) > 0 {
			roleMenus := make([]model.RoleMenu, 0, len(role.MenuIDs))
			for _, menuID := range role.MenuIDs {
				roleMenus = append(roleMenus, model.RoleMenu{
					RoleID: role.ID,
					MenuID: menuID,
				})
			}
			if err := tx.Create(&roleMenus).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// Update 更新角色
func (r *RoleRepository) Update(id uint, updates map[string]interface{}) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 更新角色基本信息
		roleUpdates := make(map[string]interface{})
		for k, v := range updates {
			if k != "menu_ids" {
				roleUpdates[k] = v
			}
		}
		if err := tx.Model(&model.Role{ID: id}).Updates(roleUpdates).Error; err != nil {
			return err
		}

		// 如果更新了菜单ID列表
		if menuIDs, ok := updates["menu_ids"].([]uint); ok {
			var count int64
			err := tx.Model(&model.RoleMenu{}).Where("role_id = ?", id).Count(&count).Error
			if err != nil {
				return err
			}
			fmt.Println("Records to delete:", count, id)
			// 删除原有的角色-菜单关联
			if err := tx.Where("role_id = ?", id).Delete(&model.RoleMenu{}).Error; err != nil {
				return err
			}

			// 创建新的角色-菜单关联
			if len(menuIDs) > 0 {
				roleMenus := make([]model.RoleMenu, 0, len(menuIDs))
				for _, menuID := range menuIDs {
					roleMenus = append(roleMenus, model.RoleMenu{
						RoleID: id,
						MenuID: menuID,
					})
				}
				if err := tx.Create(&roleMenus).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

// Delete 删除角色
func (r *RoleRepository) Delete(id uint) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 删除角色-菜单关联
		if err := tx.Where("role_id = ?", id).Delete(&model.RoleMenu{}).Error; err != nil {
			return err
		}

		// 删除角色
		if err := tx.Delete(&model.Role{ID: id}).Error; err != nil {
			return err
		}

		return nil
	})
}

// FindById 根据ID查找角色
func (r *RoleRepository) FindById(id uint) (*model.Role, error) {
	var role model.Role
	err := database.DB.First(&role, id).Error
	if err != nil {
		return nil, err
	}

	// 获取角色的菜单ID
	var menuIDs []uint
	err = database.DB.Model(&model.RoleMenu{}).
		Where("role_id = ?", role.ID).
		Pluck("menu_id", &menuIDs).Error
	if err != nil {
		return nil, err
	}
	role.MenuIDs = menuIDs

	return &role, nil
} 

// 不分页获取所有角色
func (r *RoleRepository) FindAllRoles() ([]model.Role, error) {
	var roles []model.Role
	err := database.DB.Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}
