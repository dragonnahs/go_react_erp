/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-10 13:52:30
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 14:07:45
 * @FilePath: \go_react_erp\backend\internal\service\menu.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"erp-sys/internal/model"
	"erp-sys/internal/repository"
	"errors"
)

type MenuService struct {
	menuRepo *repository.MenuRepository
}

func NewMenuService() *MenuService {
	return &MenuService{
		menuRepo: repository.NewMenuRepository(),
	}
}

// List 获取菜单列表
func (s *MenuService) List(page, pageSize int) ([]model.Menu, int64, error) {
	return s.menuRepo.FindAll(page, pageSize)
}

// GetMenuTree 获取菜单树
func (s *MenuService) GetMenuTree() ([]*repository.TreeNode, error) {
	return s.menuRepo.GetMenuTree()
}

// Create 创建菜单
func (s *MenuService) Create(menu *model.Menu) error {
	// 如果是子菜单，检查父菜单是否存在
	if menu.ParentID != 0 {
		parent, err := s.menuRepo.FindById(menu.ParentID)
		if err != nil {
			return errors.New("parent menu not found")
		}
		if parent.Type != "menu" {
			return errors.New("parent must be menu type")
		}
	}

	return s.menuRepo.Create(menu)
}

// Update 更新菜单
func (s *MenuService) Update(id uint, updates map[string]interface{}) error {
	// 检查菜单是否存在
	_, err := s.menuRepo.FindById(id)

	if err != nil {
		return errors.New("menu not found")
	}

	// 如果更新了父ID，需要检查父菜单
	if parentID, ok := updates["parent_id"].(uint); ok && parentID != 0 {
		parent, err := s.menuRepo.FindById(parentID)
		if err != nil {
			return errors.New("parent menu not found")
		}
		if parent.Type != "menu" {
			return errors.New("parent must be menu type")
		}
		// 不能将父菜单设置为自己的子菜单
		if id == parentID {
			return errors.New("cannot set parent to self")
		}
	}

	return s.menuRepo.Update(id, updates)
}

// Delete 删除菜单
func (s *MenuService) Delete(id uint) error {
	return s.menuRepo.Delete(id)
}

// GetVisibleMenus 获取可见菜单树
func (s *MenuService) GetVisibleMenus() ([]model.Menu, error) {
	return s.menuRepo.GetVisibleMenus()
}

// GetFullMenuTree 获取完整的菜单树（包括按钮）
func (s *MenuService) GetFullMenuTree() ([]model.Menu, error) {
	return s.menuRepo.GetFullMenuTree()
} 