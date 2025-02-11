package controller

import (
	"erp-sys/internal/model"
	"erp-sys/internal/service"
	"erp-sys/pkg/constants"
	"erp-sys/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MenuController struct {
	menuService *service.MenuService
}

func NewMenuController() *MenuController {
	return &MenuController{
		menuService: service.NewMenuService(),
	}
}

// List 获取菜单列表
func (c *MenuController) List(ctx *gin.Context) {
	page := 1
	pageSize := 10

	if p, err := strconv.Atoi(ctx.DefaultQuery("current", "1")); err == nil && p > 0 {
		page = p
	}
	if ps, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "10")); err == nil && ps > 0 {
		pageSize = ps
	}

	menus, total, err := c.menuService.List(page, pageSize)
	if err != nil {
		response.ServerError(ctx)
		return
	}
	response.SuccessList(ctx, menus, total)
}

// GetMenuTree 获取菜单树
func (c *MenuController) GetMenuTree(ctx *gin.Context) {
	menus, err := c.menuService.GetMenuTree()
	if err != nil {
		response.ServerError(ctx)
		return
	}
	response.Success(ctx, menus)
}

// Create 创建菜单
func (c *MenuController) Create(ctx *gin.Context) {
	var menu model.Menu
	if err := ctx.ShouldBindJSON(&menu); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	if err := c.menuService.Create(&menu); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, menu, constants.CREATE_SUCCESS)
}

// Update 更新菜单
func (c *MenuController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	var menu model.Menu
	if err := ctx.ShouldBindJSON(&menu); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	updates := make(map[string]interface{})
	if menu.Name != "" {
		updates["name"] = menu.Name
	}
	if menu.Path != "" {
		updates["path"] = menu.Path
	}
	if menu.Component != "" {
		updates["component"] = menu.Component
	}
	if menu.Permission != "" {
		updates["permission"] = menu.Permission
	}
	if menu.Type != "" {
		updates["type"] = menu.Type
	}
	if menu.Icon != "" {
		updates["icon"] = menu.Icon
	}
	if menu.ParentID > 0 {
		updates["parent_id"] = menu.ParentID
	}
	updates["sort"] = menu.Sort
	updates["visible"] = menu.Visible

	if err := c.menuService.Update(uint(id), updates); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, nil, constants.UPDATE_SUCCESS)
}

// Delete 删除菜单
func (c *MenuController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.ParamError(ctx, "invalid id")
		return
	}

	if err := c.menuService.Delete(uint(id)); err != nil {
		response.Error(ctx, constants.ERROR, err.Error())
		return
	}

	response.SuccessWithMsg(ctx, nil, constants.DELETE_SUCCESS)
}

// GetVisibleMenus 获取可见菜单树
func (c *MenuController) GetVisibleMenus(ctx *gin.Context) {
	menus, err := c.menuService.GetVisibleMenus()
	if err != nil {
		response.ServerError(ctx)
		return
	}
	response.Success(ctx, menus)
} 