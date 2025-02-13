export interface MenuItem {
  id: number;
  name: string;          // 菜单名称
  path: string;          // 路由路径
  component?: string;    // 组件路径
  icon?: string;         // 图标
  parent_id?: number;    // 父菜单ID
  type: 'menu' | 'button'; // 类型：菜单或按钮
  permission?: string;   // 权限标识
  visible: boolean;      // 是否可见
  sort: number;          // 排序
  children?: MenuItem[]; // 子菜单
  created_at: string;
  updated_at: string;
} 