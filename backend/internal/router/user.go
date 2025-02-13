package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterUserRoutes 注册用户相关路由
func RegisterUserRoutes(v1 *gin.RouterGroup) {
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
		userGroup.GET("/current", userController.GetCurrentUser)
	}
} 