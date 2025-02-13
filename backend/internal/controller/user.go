package controller

import (
	"erp-sys/internal/model"
	"erp-sys/internal/service"
	"erp-sys/pkg/constants"
	"erp-sys/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService *service.UserService
}

func NewUserController() *UserController {
	return &UserController{
		userService: service.NewUserService(),
	}
}

// Login 用户登录
func (c *UserController) Login(ctx *gin.Context) {
	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&loginData); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	token, err := c.userService.Login(loginData.Username, loginData.Password)
	if err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.Success(ctx, gin.H{"token": token})
}

// List 获取用户列表
func (c *UserController) List(ctx *gin.Context) {
	// 获取分页参数，默认第1页，每页10条
	page := 1
	pageSize := 10

	if p, err := strconv.Atoi(ctx.DefaultQuery("current", "1")); err == nil && p > 0 {
		page = p
	}
	if ps, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10")); err == nil && ps > 0 {
		pageSize = ps
	}

	// 获取筛选参数
	username := ctx.Query("username")
	email := ctx.Query("email")

	users, total, err := c.userService.List(page, pageSize, username, email)
	if err != nil {
		response.ServerError(ctx)
		return
	}
	response.SuccessList(ctx, users, total)
}

// Create 创建用户
func (c *UserController) Create(ctx *gin.Context) {
	var user model.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	if err := c.userService.Create(&user); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, user, constants.CREATE_SUCCESS)
}

// Update 更新用户
func (c *UserController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	var user model.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	user.ID = uint(id)
	if err := c.userService.Update(&user); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, user, constants.UPDATE_SUCCESS)
}

// Delete 删除用户
func (c *UserController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	if err := c.userService.Delete(uint(id)); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, nil, constants.DELETE_SUCCESS)
}

// GetById 获取单个用户
func (c *UserController) GetById(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	user, err := c.userService.GetById(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, user)
}

// Register 用户注册
func (c *UserController) Register(ctx *gin.Context) {
	var registerData struct {
		Username string `json:"username" binding:"required,min=3,max=32"`
		Password string `json:"password" binding:"required,min=6,max=32"`
		Email    string `json:"email" binding:"required,email"`
		Role     string `json:"role" binding:"required,oneof=admin user"`
	}

	if err := ctx.ShouldBindJSON(&registerData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := &model.User{
		Username: registerData.Username,
		Password: registerData.Password,
		Email:    registerData.Email,
		Status:   "active", // 默认状态为激活
	}

	if err := c.userService.Register(user); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 生成 token
	token, err := c.userService.Login(user.Username, registerData.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Registration successful but failed to login"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Registration successful",
		"token":   token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role_id":  user.RoleID,
		},
	})
}

// GetCurrentUser 获取当前登录用户信息
func (c *UserController) GetCurrentUser(ctx *gin.Context) {
	// 从上下文获取当前用户ID
	userId := ctx.GetUint("userId")
	if userId == 0 {
		response.Error(ctx, constants.ERROR, "未找到用户信息")
		return
	}

	user, err := c.userService.GetById(userId)
	if err != nil {
		response.Error(ctx, constants.ERROR, "获取用户信息失败")
		return
	}

	response.Success(ctx, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"role_id":    user.RoleID,
		"status":     user.Status,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
}

// GetUserRoutes 获取当前用户的路由权限
func (c *UserController) GetUserRoutes(ctx *gin.Context) {
	// 从上下文获取当前用户ID
	userId := ctx.GetUint("userId")
	if userId == 0 {
		response.Error(ctx, constants.ERROR, "未找到用户信息")
		return
	}

	// 获取用户的路由权限
	routes, err := c.userService.GetUserRoutes(userId)
	if err != nil {
		response.Error(ctx, constants.ERROR, "获取用户路由权限失败")
		return
	}

	response.Success(ctx, gin.H{
		"routes": routes,
	})
}

// 其他 CRUD 方法... 