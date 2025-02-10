package main

import (
	"erp-sys/config"
	"erp-sys/internal/middleware"
	"erp-sys/internal/router"
	"erp-sys/pkg/database"
	"erp-sys/pkg/jwt"
	"erp-sys/pkg/logger"

	"github.com/joho/godotenv"

	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Printf("Error loading .env file: %v", err)
	}

	// 初始化配置
	config.Init()
	
	// 初始化日志
	logger.Init()
	
	// 初始化数据库
	database.Init()
	
	// 初始化 JWT
	jwt.Init()
	
	// 创建 gin 实例
	app := gin.New()
	
	// 使用中间件
	app.Use(middleware.Logger())
	app.Use(middleware.Recovery())
	app.Use(middleware.Cors())
	
	// 注册路由
	router.RegisterRoutes(app)
	
	// 启动服务
	app.Run(":8080")
} 