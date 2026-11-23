import apiClient from './axios';
import type { AdminRole, AdminUserDto, PaginatedResult } from '@/types/api';

export const adminApi = {
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResult<AdminUserDto>> {
    const response = await apiClient.get<PaginatedResult<AdminUserDto>>('/admin/users', {
      params,
    });
    return response.data;
  },

  async lockUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/admin/users/${id}/lock`);
    return response.data;
  },

  async unlockUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/admin/users/${id}/unlock`);
    return response.data;
  },

  async updateUserRole(id: string, role: AdminRole): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id: string): Promise<{ message: string; softLocked?: boolean }> {
    const response = await apiClient.delete<{ message: string; softLocked?: boolean }>(
      `/admin/users/${id}`
    );
    return response.data;
  },
};
