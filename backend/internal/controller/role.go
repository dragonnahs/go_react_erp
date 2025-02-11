package controller

import (
	"erp-sys/internal/model"
	"erp-sys/internal/service"
	"erp-sys/pkg/constants"
	"erp-sys/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RoleController struct {
	roleService *service.RoleService
}

func NewRoleController() *RoleController {
	return &RoleController{
		roleService: service.NewRoleService(),
	}
}

// List 获取角色列表
func (c *RoleController) List(ctx *gin.Context) {
	page := 1
	pageSize := 10
	name := ctx.Query("name")

	if p, err := strconv.Atoi(ctx.DefaultQuery("current", "1")); err == nil && p > 0 {
		page = p
	}
	if ps, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10")); err == nil && ps > 0 {
		pageSize = ps
	}

	roles, total, err := c.roleService.List(page, pageSize, name)
	if err != nil {
		response.ServerError(ctx)
		return
	}
	response.SuccessList(ctx, roles, total)
}

// Create 创建角色
func (c *RoleController) Create(ctx *gin.Context) {
	var role model.Role
	if err := ctx.ShouldBindJSON(&role); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	if err := c.roleService.Create(&role); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, role, constants.CREATE_SUCCESS)
}

// Update 更新角色
func (c *RoleController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	var role model.Role
	if err := ctx.ShouldBindJSON(&role); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	updates := make(map[string]interface{})
	if role.Name != "" {
		updates["name"] = role.Name
	}
	if role.Code != "" {
		updates["code"] = role.Code
	}
	if role.Description != "" {
		updates["description"] = role.Description
	}
	updates["status"] = role.Status
	updates["sort"] = role.Sort
	if len(role.MenuIDs) > 0 {
		updates["menu_ids"] = role.MenuIDs
	}

	if err := c.roleService.Update(uint(id), updates); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, nil, constants.UPDATE_SUCCESS)
}

// Delete 删除角色
func (c *RoleController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	if err := c.roleService.Delete(uint(id)); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, nil, constants.DELETE_SUCCESS)
}

// GetById 根据ID获取角色
func (c *RoleController) GetById(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	role, err := c.roleService.GetById(uint(id))
	if err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.Success(ctx, role)
} 