package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterRoleRoutes 注册角色相关路由
func RegisterRoleRoutes(r *gin.RouterGroup) {
	// 角色路由组
	roleController := controller.NewRoleController()
	roleRoutes := r.Group("/roles")
	roleRoutes.Use(middleware.Auth())
	{
		roleRoutes.GET("", roleController.List)           // 获取角色列表
		roleRoutes.POST("", roleController.Create)        // 创建角色
		roleRoutes.PUT("/:id", roleController.Update)     // 更新角色
		roleRoutes.DELETE("/:id", roleController.Delete)  // 删除角色
		roleRoutes.GET("/:id", roleController.GetById)    // 获取角色详情
		roleRoutes.GET("/all", roleController.GetAllRoles)
	}
} 