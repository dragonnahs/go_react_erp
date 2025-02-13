export interface MenuItem {
  id: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  type: 'menu' | 'button';
  children?: MenuItem[];
}

export interface RouteConfig {
  path: string;
  name: string;
  key: string | number;
  component?: any;
  routes?: RouteConfig[];
} 