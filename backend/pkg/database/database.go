/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:47:16
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-11 16:00:07
 * @FilePath: \go_react_erp\erp-sys\pkg\database\database.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package database

import (
	"erp-sys/config"
	"erp-sys/internal/model"
	"erp-sys/pkg/logger"
	"fmt"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	var err error

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.Config.GetString("database.username"),
		config.Config.GetString("database.password"),
		config.Config.GetString("database.host"),
		config.Config.GetInt("database.port"),
		config.Config.GetString("database.dbname"),
	)

	fmt.Println(dsn)
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Log.Fatal("Failed to connect to database", zap.Error(err))
	}

	// 配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		logger.Log.Fatal("Failed to get database instance", zap.Error(err))
	}

	sqlDB.SetMaxIdleConns(config.Config.GetInt("database.max_idle_conns"))
	sqlDB.SetMaxOpenConns(config.Config.GetInt("database.max_open_conns"))

	// 自动迁移数据库结构
	err = DB.AutoMigrate(
		&model.User{},
		&model.Menu{},
		&model.Role{},
		&model.RoleMenu{},
		&model.Project{},
		&model.Task{},
	)
	if err != nil {
		logger.Log.Fatal("Failed to auto migrate database", zap.Error(err))
	}

	fmt.Println("Database connected and migrated successfully")
} 