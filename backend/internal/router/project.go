package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterProjectRoutes(r *gin.RouterGroup) {
	projectController := controller.NewProjectController()

	projects := r.Group("/projects")
	projects.Use(middleware.Auth())
	{
		projects.GET("/current", projectController.GetCurrentProject)
	}

	tasks := r.Group("/tasks")
	tasks.Use(middleware.Auth())
	{
		tasks.PUT("/:taskId/position", projectController.UpdateTaskPosition)
		tasks.PUT("/:taskId/status", projectController.UpdateTaskStatus)
	}

	projectGroup := r.Group("/api/project")
	{
		projectGroup.POST("/tasks", projectController.CreateTask)
	}
} 