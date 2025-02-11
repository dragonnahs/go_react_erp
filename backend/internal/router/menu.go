package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterMenuRoutes 注册菜单相关路由
func RegisterMenuRoutes(v1 *gin.RouterGroup) {
	menuController := controller.NewMenuController()
	
	menuGroup := v1.Group("/menus")
	menuGroup.Use(middleware.Auth())
	{
		menuGroup.GET("", menuController.List)
		menuGroup.GET("/tree", menuController.GetMenuTree)
		menuGroup.GET("/full-tree", menuController.GetFullMenuTree)
		menuGroup.GET("/visible", menuController.GetVisibleMenus)
		menuGroup.POST("", menuController.Create)
		menuGroup.PUT("/:id", menuController.Update)
		menuGroup.DELETE("/:id", menuController.Delete)
	}
} 