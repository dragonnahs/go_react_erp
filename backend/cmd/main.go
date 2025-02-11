package main

import (
	"erp-sys/config"
	"erp-sys/pkg/database"
	"fmt"
)

func main() {
	// ... 其他初始化代码 ...
	config.Init()

	// 初始化数据库
	database.Init()
	
	// 初始化基础数据
	database.SeedData()

	// ... 其他代码 ...

	fmt.Println("Application started successfully")
} 