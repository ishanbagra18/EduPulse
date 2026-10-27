import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import supabase from "../services/supabase";
import type { Attendance } from "../types";

const OFFLINE_KEY = "offline_attendance_queue";

export async function saveAttendanceOffline(entry: Attendance) {
  const raw = await AsyncStorage.getItem(OFFLINE_KEY);
  const list: Attendance[] = raw ? JSON.parse(raw) : [];
  list.push(entry);
  await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
}

export async function syncOfflineAttendance() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return { synced: 0 };

  const raw = await AsyncStorage.getItem(OFFLINE_KEY);
  if (!raw) return { synced: 0 };
  const list: Attendance[] = JSON.parse(raw);
  let synced = 0;
  for (const entry of list) {
    try {
      await supabase.from("attendance").insert({
        student_id: entry.student_id,
        class_id: entry.class_id,
        teacher_id: entry.teacher_id,
        date: entry.date,
        status: entry.status,
        remarks: entry.remarks,
        synced: true,
      });
      synced++;
    } catch (err) {
      // stop on error to avoid deleting unsynced data
      console.warn("Attendance sync error", err);
      break;
    }
  }
  if (synced === list.length) {
    await AsyncStorage.removeItem(OFFLINE_KEY);
  } else if (synced > 0) {
    const remaining = list.slice(synced);
    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
  }
  return { synced };
}
