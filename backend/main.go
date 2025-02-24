/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-13 09:53:35
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-24 15:11:25
 * @FilePath: \go_react_erp\backend\main.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package main

import (
	"erp-sys/config"
	"erp-sys/internal/middleware"
	"erp-sys/internal/router"
	"erp-sys/pkg/database"
	"erp-sys/pkg/jwt"
	"erp-sys/pkg/logger"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	app.Run(":" + config.Config.GetString("server.port"))
}
