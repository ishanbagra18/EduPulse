import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as AttendanceService from "../services/attendance";
import {
    saveAttendanceOffline,
    syncOfflineAttendance,
} from "../utils/offlineAttendance";

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await AttendanceService.fetchClasses();
      return data ?? [];
    },
  });
}

export function useStudentsForClass(classId?: string) {
  return useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await AttendanceService.fetchStudentsByClass(classId);
      return data ?? [];
    },
    enabled: !!classId,
  });
}

export function useSubmitAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: any[]) => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        // save each entry offline
        for (const e of entries) await saveAttendanceOffline(e);
        return { offline: true, count: entries.length };
      }
      const res = await AttendanceService.submitAttendanceBulkUpsert(entries);
      if (res.error) throw res.error;
      // try syncing any queued items as well
      await syncOfflineAttendance();
      qc.invalidateQueries({ queryKey: ["attendance"] });
      return {
        offline: false,
        inserted: res.data?.inserted ?? 0,
        updated: res.data?.updated ?? 0,
      };
    },
  });
}

export async function manualSync() {
  return await syncOfflineAttendance();
}

export function useAttendanceForStudent(studentId?: string) {
  return useQuery({
    queryKey: ["attendance", "student", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } =
        await AttendanceService.fetchAttendanceByStudent(studentId);
      return data ?? [];
    },
    enabled: !!studentId,
  });
}

export function useAttendanceForClassDate(classId?: string, date?: string) {
  return useQuery({
    queryKey: ["attendance", "class", classId, date],
    queryFn: async () => {
      if (!classId || !date) return [];
      const { data } = await AttendanceService.fetchAttendanceByClassDate(
        classId,
        date,
      );
      return data ?? [];
    },
    enabled: !!classId && !!date,
  });
}
