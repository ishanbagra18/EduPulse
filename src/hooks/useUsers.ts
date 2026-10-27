import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as UsersService from "../services/users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await UsersService.fetchUsers();
      return data ?? [];
    },
  });
}

export function useUser(id?: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await UsersService.fetchUserById(id);
      return data ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      profile?: any;
    }) => {
      const r = await UsersService.createAdminUser({
        email: payload.email,
        password: payload.password,
        profile: payload.profile,
      });
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await UsersService.deleteUser(id);
      if (r.error) throw r.error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const r = await UsersService.updateUserProfile(id, patch);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
