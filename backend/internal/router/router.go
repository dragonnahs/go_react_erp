/*
 * @Author: shanlonglong danlonglong@weimiao.cn
 * @Date: 2025-02-08 16:47:26
 * @LastEditors: shanlonglong danlonglong@weimiao.cn
 * @LastEditTime: 2025-02-11 16:47:19
 * @FilePath: \go_react_erp\backend\internal\router\router.go
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
package router

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(r *gin.Engine) {
	// API 版本组
	v1 := r.Group("/api/v1")
	
	// 注册各模块路由
	RegisterUserRoutes(v1)   // 用户模块路由
	RegisterMenuRoutes(v1)   // 菜单模块路由
	RegisterRoleRoutes(v1)   // 角色模块路由
	RegisterMemeTokenRoutes(v1)
	
	// ... 其他模块路由注册
} 