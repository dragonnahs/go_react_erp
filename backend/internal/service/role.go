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