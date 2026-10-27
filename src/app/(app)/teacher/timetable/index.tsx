import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import supabase from "../../../../services/supabase";
import * as TimetableService from "../../../../services/timetable";

async function fetchTeacherRecord(userId: string) {
  const { data } = await supabase
    .from("teachers")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export default function TeacherTimetable() {
  const { user } = useAuthContext();
  const { data: teacher } = useQuery<any | null>({
    queryKey: ["teacherRecord", user?.id],
    queryFn: () => fetchTeacherRecord(user!.id),
    enabled: !!user?.id,
  });
  const teacherId = teacher?.id;
  // fetch timetable entries where teacher_id = teacherId (with joined fields)
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["timetableTeacher", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data } =
        await TimetableService.fetchTimetableForTeacher(teacherId);
      return data ?? [];
    },
    enabled: !!teacherId,
  });

  if (isLoading) return <ActivityIndicator />;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Timetable</Text>
      <FlatList
        data={data}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.subjectText}>
                {item.subjects?.name ?? item.subject_id}
              </Text>
              <Text style={styles.timeText}>
                {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
              </Text>
            </View>
            <Text style={styles.metaText}>
              Teacher:{" "}
              {item.teachers?.users?.full_name ??
                item.teachers?.full_name ??
                item.teacher_id}
            </Text>
            <Text style={styles.metaText}>
              Class:{" "}
              {item.classes
                ? `${item.classes.name}${item.classes.section ? ` ${item.classes.section}` : ""}`
                : item.class_id}{" "}
              • Room: {item.room ?? "-"}
            </Text>
            <Text style={styles.metaText}>Day: {item.day}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: { fontWeight: "700", color: "#333" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  cell: { color: "#222" },
  subject: { flex: 3, paddingRight: 8 },
  teacher: { flex: 2, paddingRight: 8 },
  class: { flex: 1, paddingRight: 8 },
  day: { flex: 1, paddingRight: 8 },
  time: { flex: 1, textAlign: "right" },
  room: { flex: 1, paddingLeft: 8, textAlign: "right" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, elevation: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subjectText: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  timeText: { fontSize: 13, color: "#374151" },
  metaText: { fontSize: 13, color: "#4b5563", marginTop: 2 },
});
