package repository

import (
	"erp-sys/internal/model"
	"erp-sys/pkg/database"
	"sort"

	"gorm.io/gorm"
)

type MenuRepository struct{}

func NewMenuRepository() *MenuRepository {
	return &MenuRepository{}
}

// TreeNode 表示树形结构的节点
type TreeNode struct {
	ID       uint        `json:"id"`
	Name     string      `json:"name"`
	Children []*TreeNode `json:"children,omitempty"`
}

// buildMenuTree 构建菜单树形结构的通用方法
func buildMenuTree(menus []model.Menu) []model.Menu {
	menuMap := make(map[uint]*model.Menu)

	// 第一步：创建所有菜单的副本并建立映射关系
	for i := range menus {
		menuCopy := menus[i]
		// 初始化 Children 切片
		menuCopy.Children = make([]*model.Menu, 0)
		menuMap[menuCopy.ID] = &menuCopy
	}

	// 第二步：构建父子关系
	for _, menu := range menus {
		if menu.ParentID != 0 {
			// 是子菜单，添加到父菜单的 Children 中
			if parent, exists := menuMap[menu.ParentID]; exists {
				if child, exists := menuMap[menu.ID]; exists {
					parent.Children = append(parent.Children, child)
				}
			}
		}
	}

	// 第三步：收集根菜单并排序
	var rootMenus []model.Menu
	for _, menu := range menus {
		if menu.ParentID == 0 {
			if node, exists := menuMap[menu.ID]; exists {
				// 此时 node 已经包含了完整的子菜单树
				rootMenus = append(rootMenus, *node)
			}
		}
	}

	// 第四步：对根菜单排序
	sort.Slice(rootMenus, func(i, j int) bool {
		return rootMenus[i].Sort < rootMenus[j].Sort
	})

	// 第五步：递归对子菜单排序
	for i := range rootMenus {
		sortMenuTree(&rootMenus[i])
	}

	return rootMenus
}

// sortMenuTree 递归排序菜单树
func sortMenuTree(menu *model.Menu) {
	// 先对当前层级的子菜单排序
	if len(menu.Children) > 0 {
		sort.Slice(menu.Children, func(i, j int) bool {
			return menu.Children[i].Sort < menu.Children[j].Sort
		})

		// 递归对每个子菜单进行排序
		for _, child := range menu.Children {
			sortMenuTree(child)
		}
	}
}

// FindAll 获取所有菜单（树形结构，支持分页）
func (r *MenuRepository) FindAll(page, pageSize int) ([]model.Menu, int64, error) {
	// 先获取所有根菜单（parent_id = 0）的数量
	var rootCount int64
	if err := database.DB.Model(&model.Menu{}).Where("parent_id = ?", 0).Count(&rootCount).Error; err != nil {
		return nil, 0, err
	}

	// 计算分页偏移量
	offset := (page - 1) * pageSize

	// 分页获取根菜单
	var rootMenus []model.Menu
	if err := database.DB.Where("parent_id = ?", 0).
		Order("sort asc").
		Offset(offset).
		Limit(pageSize).
		Find(&rootMenus).Error; err != nil {
		return nil, 0, err
	}

	// 如果没有根菜单，直接返回
	if len(rootMenus) == 0 {
		return []model.Menu{}, rootCount, nil
	}

	// 获取这些根菜单的所有子菜单（包括子菜单的子菜单）
	var allChildMenus []model.Menu
	var getChildMenus func(parentIds []uint) error

	getChildMenus = func(parentIds []uint) error {
		if len(parentIds) == 0 {
			return nil
		}

		var childMenus []model.Menu
		if err := database.DB.Where("parent_id IN ?", parentIds).
			Order("sort asc").
			Find(&childMenus).Error; err != nil {
			return err
		}

		if len(childMenus) > 0 {
			allChildMenus = append(allChildMenus, childMenus...)
			
			// 收集下一层的父ID
			var nextParentIds []uint
			for _, menu := range childMenus {
				nextParentIds = append(nextParentIds, menu.ID)
			}
			
			// 递归获取下一层子菜单
			return getChildMenus(nextParentIds)
		}
		
		return nil
	}

	// 收集当前分页的根菜单ID
	var rootIds []uint
	for _, menu := range rootMenus {
		rootIds = append(rootIds, menu.ID)
	}

	// 递归获取所有层级的子菜单
	if err := getChildMenus(rootIds); err != nil {
		return nil, 0, err
	}

	// 合并根菜单和所有子菜单
	allMenus := append(rootMenus, allChildMenus...)

	// 构建树形结构
	treeMenus := buildMenuTree(allMenus)

	return treeMenus, rootCount, nil
}

// buildMenuTreeForSelect 构建用于选择器的菜单树
func buildMenuTreeForSelect(menus []model.Menu) []*TreeNode {
	menuMap := make(map[uint]*TreeNode)
	var rootNodes []*TreeNode

	// 第一步：创建所有节点并建立映射关系
	for _, menu := range menus {
		node := &TreeNode{
			ID:       menu.ID,
			Name:     menu.Name,
			Children: make([]*TreeNode, 0),
		}
		menuMap[menu.ID] = node
	}

	// 第二步：构建父子关系
	for _, menu := range menus {
		if menu.ParentID == 0 {
			rootNodes = append(rootNodes, menuMap[menu.ID])
		} else {
			if parent, exists := menuMap[menu.ParentID]; exists {
				parent.Children = append(parent.Children, menuMap[menu.ID])
			}
		}
	}

	// 第三步：递归排序
	sortTreeNodes(rootNodes)

	return rootNodes
}

// sortTreeNodes 递归排序树节点
func sortTreeNodes(nodes []*TreeNode) {
	if len(nodes) > 0 {
		for _, node := range nodes {
			if len(node.Children) > 0 {
				sortTreeNodes(node.Children)
			}
		}
	}
}

// GetMenuTree 获取用于选择的菜单树
func (r *MenuRepository) GetMenuTree() ([]*TreeNode, error) {
	var menus []model.Menu
	
	// 只获取菜单类型的数据（不包括按钮）
	err := database.DB.Where("type = ?", "menu").
		Order("sort asc").
		Find(&menus).Error
	if err != nil {
		return nil, err
	}

	return buildMenuTreeForSelect(menus), nil
}

// Create 创建菜单
func (r *MenuRepository) Create(menu *model.Menu) error {
	return database.DB.Create(menu).Error
}

// Update 更新菜单
func (r *MenuRepository) Update(id uint, updates map[string]interface{}) error {
	return database.DB.Model(&model.Menu{ID: id}).Updates(updates).Error
}

// Delete 删除菜单及其子菜单
func (r *MenuRepository) Delete(id uint) error {
	// 开启事务
	return database.DB.Transaction(func(tx *gorm.DB) error {
		// 先递归删除所有子菜单
		var childIds []uint
		if err := tx.Model(&model.Menu{}).
			Where("parent_id = ?", id).
			Pluck("id", &childIds).Error; err != nil {
			return err
		}

		// 递归删除子菜单
		for _, childId := range childIds {
			if err := r.Delete(childId); err != nil {
				return err
			}
		}

		// 最后删除当前菜单
		if err := tx.Delete(&model.Menu{ID: id}).Error; err != nil {
			return err
		}

		return nil
	})
}

// FindById 根据ID查找菜单
func (r *MenuRepository) FindById(id uint) (*model.Menu, error) {
	var menu model.Menu
	err := database.DB.First(&menu, id).Error
	if err != nil {
		return nil, err
	}
	return &menu, nil
}

// GetVisibleMenus 获取可见的菜单树
func (r *MenuRepository) GetVisibleMenus() ([]model.Menu, error) {
	var menus []model.Menu
	
	// 获取所有可见的菜单
	err := database.DB.Where("visible = ? AND type = ?", true, "menu").
		Order("sort asc").
		Find(&menus).Error
	if err != nil {
		return nil, err
	}

	return buildMenuTree(menus), nil
}

// GetFullMenuTree 获取完整的菜单树（包括按钮）
func (r *MenuRepository) GetFullMenuTree() ([]model.Menu, error) {
	var menus []model.Menu
	
	// 获取所有菜单和按钮，并按照排序字段排序
	err := database.DB.Order("sort asc").Find(&menus).Error
	if err != nil {
		return nil, err
	}

	return buildMenuTree(menus), nil
}

