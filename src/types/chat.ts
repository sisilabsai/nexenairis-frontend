export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Channel {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private';
  users: User[];
  created_by: number;
}
