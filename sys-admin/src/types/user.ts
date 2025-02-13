export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  status: string;
  role_id: number;
  role?: {
    id: number;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
} 