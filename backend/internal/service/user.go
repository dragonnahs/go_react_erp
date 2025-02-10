package service

import (
	"erp-sys/internal/model"
	"erp-sys/internal/repository"
	"erp-sys/pkg/jwt"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService() *UserService {
	return &UserService{
		userRepo: repository.NewUserRepository(),
	}
}

// List 获取用户列表
func (s *UserService) List(page, pageSize int, username, email string) ([]model.User, int64, error) {
	return s.userRepo.FindAll(page, pageSize, username, email)
}

// Create 创建用户
func (s *UserService) Create(user *model.User) error {
	// 检查用户名是否已存在
	exists, err := s.userRepo.ExistsByUsername(user.Username)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("username already exists")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.userRepo.Create(user)
}

// Update 更新用户信息
func (s *UserService) Update(user *model.User) error {
	// 检查用户是否存在
	existingUser, err := s.userRepo.FindById(user.ID)
	if err != nil {
		return err
	}
	if existingUser == nil {
		return errors.New("user not found")
	}

	// 创建更新字段映射
	updates := make(map[string]interface{})

	// 只更新非空字段
	if user.Username != "" {
		updates["username"] = user.Username
	}
	if user.Email != "" {
		updates["email"] = user.Email
	}
	if user.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		updates["password"] = string(hashedPassword)
	}
	if user.Role != "" {
		updates["role"] = user.Role
	}
	if user.Status != "" {
		updates["status"] = user.Status
	}

	return s.userRepo.Update(user.ID, updates)
}

// Delete 删除用户
func (s *UserService) Delete(id uint) error {
	return s.userRepo.Delete(id)
}

// GetById 根据ID获取用户
func (s *UserService) GetById(id uint) (*model.User, error) {
	return s.userRepo.FindById(id)
}

// Login 用户登录
func (s *UserService) Login(username, password string) (string, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", errors.New("user not found")
	}

	// 验证密码
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid password")
	}

	// 生成 JWT token
	token, err := jwt.GenerateToken(user.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}

// Register 用户注册
func (s *UserService) Register(user *model.User) error {
	// 检查用户名是否已存在
	exists, err := s.userRepo.ExistsByUsername(user.Username)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("username already exists")
	}

	// 检查邮箱是否已存在
	exists, err = s.userRepo.ExistsByEmail(user.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already exists")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	return s.userRepo.Create(user)
} 