import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  tenant?: {
    id: number;
    name: string;
    settings?: {
      branches_enabled?: boolean;
      consolidated_reporting_enabled?: boolean;
    };
  };
}

export function useAuth() {
  const { data: me, isLoading: loading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await axios.get<User>('/api/me');
      return response.data;
    },
  });

  return {
    me,
    loading,
    isAuthenticated: !!me,
  };
}