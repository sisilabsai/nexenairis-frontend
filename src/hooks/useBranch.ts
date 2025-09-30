import { Branch, BranchFormData } from '@/types/branch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '@/lib/api';
import { AxiosResponse } from 'axios';

const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...branchKeys.lists(), { ...filters }] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
};

export const useBranches = (filters?: Record<string, any>) => {
  return useQuery<Branch[]>({
    queryKey: branchKeys.list(filters ?? {}),
    queryFn: async () => {
      const response = await branchApi.getBranches();
      // ApiService returns the server envelope: { success, message, data }
      // For paginated endpoints BaseController->paginatedResponse returns data as array under `data`.
      return response?.data ?? [];
    },
  });
};

export const useBranch = (id: number) => {
  return useQuery<Branch>({
    queryKey: branchKeys.detail(id),
    queryFn: async () => {
      const response = await branchApi.getBranch(id);
      // Expect envelope { success, message, data }
      if (!response?.data) throw new Error('Branch not found');
      return response.data as Branch;
    },
    enabled: !!id,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, BranchFormData>({
    mutationFn: async (data) => {
      const response = await branchApi.createBranch(data);
      if (!response?.data) throw new Error('Failed to create branch');
      return response.data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};

export const useUpdateBranch = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, Partial<Branch>>({
    mutationFn: async (data) => {
      const response = await branchApi.updateBranch(id, data);
      if (!response?.data) throw new Error('Failed to update branch');
      return response.data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await branchApi.deleteBranch(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};

export const useToggleBranchStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error>({
    mutationFn: async () => {
      const response = await branchApi.toggleBranchStatus(id);
      if (!response?.data) throw new Error('Failed to toggle branch status');
      return response.data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
};

export const useCurrentBranch = () => {
  return useQuery<Branch | null>({
    queryKey: ['currentBranch'],
    queryFn: async () => {
      const response = await branchApi.getCurrentBranch();
      return response?.data ?? null;
    },
  });
};

export const useSwitchBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, number>({
    mutationFn: async (branchId) => {
      const response = await branchApi.switchBranch(branchId);
      if (!response?.data) throw new Error('Failed to switch branch');
      return response.data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // Invalidate all queries as branch change affects all data
    },
  });
};
