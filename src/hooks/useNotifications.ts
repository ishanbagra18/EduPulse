import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as NotificationsService from "../services/notifications";

export function useNotificationsForUser(user?: any) {
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } =
        await NotificationsService.fetchNotificationsForUser(user);
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const r = await NotificationsService.createNotification(payload);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
