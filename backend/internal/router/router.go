package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	// API 版本组
	v1 := r.Group("/api/v1")
	
	// 用户相关路由
	userController := controller.NewUserController()
	// 公开路由
	v1.POST("/login", userController.Login)
	v1.POST("/register", userController.Register)

	// 需要认证的路由
	userGroup := v1.Group("/users")
	userGroup.Use(middleware.Auth())
	{
		userGroup.GET("", userController.List)
		userGroup.POST("", userController.Create)
		userGroup.GET("/:id", userController.GetById)
		userGroup.PUT("/:id", userController.Update)
		userGroup.DELETE("/:id", userController.Delete)
	}
	
	// 其他业务模块路由...
} 