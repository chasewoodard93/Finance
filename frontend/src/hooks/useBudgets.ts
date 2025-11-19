hooks/useBudgets.ts  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { Budget } from '../api/client';

export const useBudgets = (params?: {
  practice_id?: string;
  year?: number;
  month?: number;
}) => {
  return useQuery({
    queryKey: ['budgets', params],
    queryFn: async () => {
      const response = await apiClient.getBudgets(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
};

export const useBudget = (id: number) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      const response = await apiClient.getBudget(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.createBudget(budget);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Budget> }) => {
      const response = await apiClient.updateBudget(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', variables.id] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.deleteBudget(id);
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
