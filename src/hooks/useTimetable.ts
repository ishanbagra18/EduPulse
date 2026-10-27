import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as TimetableService from "../services/timetable";

export function useTimetableForClass(classId?: string) {
  return useQuery({
    queryKey: ["timetable", classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await TimetableService.fetchTimetableForClass(classId);
      return data ?? [];
    },
    enabled: !!classId,
  });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const r = await TimetableService.createTimetableEntry(payload);
      if (r.error) throw r.error;
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable"] }),
  });
}
