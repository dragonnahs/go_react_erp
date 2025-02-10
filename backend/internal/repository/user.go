/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:58:07
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-10 12:05:06
 * @FilePath: \go_react_erp\backend\internal\repository\user.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package repository

import (
	"erp-sys/internal/model"
	"erp-sys/pkg/database"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

// FindAll 获取所有用户（分页）
func (r *UserRepository) FindAll(page, pageSize int, username, email string) ([]model.User, int64, error) {
	var users []model.User
	var total int64
	
	query := database.DB.Model(&model.User{})
	
	// 添加筛选条件
	if username != "" {
		query = query.Where("username LIKE ?", "%"+username+"%")
	}
	if email != "" {
		query = query.Where("email LIKE ?", "%"+email+"%")
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// FindById 根据ID查找用户
func (r *UserRepository) FindById(id uint) (*model.User, error) {
	var user model.User
	err := database.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByUsername 根据用户名查找用户
func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ExistsByUsername 检查用户名是否存在
func (r *UserRepository) ExistsByUsername(username string) (bool, error) {
	var count int64
	err := database.DB.Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}

// ExistsByEmail 检查邮箱是否存在
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	err := database.DB.Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// Create 创建用户
func (r *UserRepository) Create(user *model.User) error {
	return database.DB.Create(user).Error
}

// Update 更新用户
func (r *UserRepository) Update(id uint, updates map[string]interface{}) error {
	return database.DB.Model(&model.User{ID: id}).Updates(updates).Error
}

// Delete 删除用户
func (r *UserRepository) Delete(id uint) error {
	return database.DB.Delete(&model.User{}, id).Error
} 