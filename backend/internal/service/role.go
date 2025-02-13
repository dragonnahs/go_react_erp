/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-11 15:34:58
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-13 13:54:09
 * @FilePath: \go_react_erp\backend\internal\service\role.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package service

import (
	"erp-sys/internal/model"
	"erp-sys/internal/repository"
	"errors"
)

type RoleService struct {
	roleRepo *repository.RoleRepository
}

func NewRoleService() *RoleService {
	return &RoleService{
		roleRepo: repository.NewRoleRepository(),
	}
}

// List 获取角色列表
func (s *RoleService) List(page, pageSize int, name string) ([]model.Role, int64, error) {
	return s.roleRepo.FindAll(page, pageSize, name)
}

// Create 创建角色
func (s *RoleService) Create(role *model.Role) error {
	return s.roleRepo.Create(role)
}

// Update 更新角色
func (s *RoleService) Update(id uint, updates map[string]interface{}) error {
	// 检查角色是否存在
	_, err := s.roleRepo.FindById(id)
	if err != nil {
		return errors.New("role not found")
	}
	return s.roleRepo.Update(id, updates)
}

// Delete 删除角色
func (s *RoleService) Delete(id uint) error {
	return s.roleRepo.Delete(id)
}

// GetById 根据ID获取角色
func (s *RoleService) GetById(id uint) (*model.Role, error) {
	return s.roleRepo.FindById(id)
} 
// 获取所有角色不分页
func (s *RoleService) GetAll() ([]model.Role, error) {
	return s.roleRepo.FindAllRoles()
}
