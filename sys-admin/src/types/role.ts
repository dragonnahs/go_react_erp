export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  status: boolean;
  sort: number;
  menu_ids: number[];
  created_at: string;
  updated_at: string;
} 