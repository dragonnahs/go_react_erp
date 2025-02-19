package router

import (
	"erp-sys/internal/controller"
	"erp-sys/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterMemeTokenRoutes(r *gin.RouterGroup) {
    memeTokenController := controller.NewMemeTokenController()
    
    memeTokenGroup := r.Group("/meme-tokens")
    memeTokenGroup.Use(middleware.Auth())
    {
        memeTokenGroup.GET("/hot", memeTokenController.GetHotMemeTokens)
    }
} 