import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import { useAttendanceForStudent } from "../../../../hooks/useAttendance";
import supabase from "../../../../services/supabase";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export default function StudentAttendance() {
  const { user } = useAuthContext();
  const [current, setCurrent] = useState(new Date());

  const { data: studentRecord, isLoading: loadingStudent } = useQuery<
    any | null
  >({
    queryKey: ["studentByUser", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!user?.id,
  });

  const studentId = studentRecord?.id as string | undefined;
  const { data: attendance = [], isLoading: loadingAttendance } =
    useAttendanceForStudent(studentId);

  const entriesForMonth = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    return (attendance as any[]).filter((a: any) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [attendance, current]);

  const attendanceMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const e of attendance as any[]) {
      if (!e?.date) continue;
      const key = new Date(e.date).toISOString().split("T")[0];
      m[key] = e.status;
    }
    return m;
  }, [attendance]);

  const summary = useMemo(() => {
    const totals = { present: 0, absent: 0, late: 0, half_day: 0 };
    let weighted = 0;
    for (const e of entriesForMonth) {
      const s = e.status as string;
      if (s === "present") {
        totals.present++;
        weighted += 1;
      } else if (s === "late") {
        totals.late++;
        weighted += 1; // treat late as present
      } else if (s === "half_day") {
        totals.half_day++;
        weighted += 0.5;
      } else {
        totals.absent++;
      }
    }
    const totalDays = entriesForMonth.length;
    const percent =
      totalDays > 0 ? Math.round((weighted / totalDays) * 100) : 0;
    return { totals, totalDays, percent };
  }, [entriesForMonth]);

  if (loadingStudent || loadingAttendance) return <ActivityIndicator />;
  if (!studentRecord) return <Text>No student record found for user.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <View style={styles.row}>
        <Button
          title="Prev"
          onPress={() =>
            setCurrent(
              new Date(current.getFullYear(), current.getMonth() - 1, 1),
            )
          }
        />
        <Text style={styles.monthLabel}>
          {current.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Button
          title="Next"
          onPress={() =>
            setCurrent(
              new Date(current.getFullYear(), current.getMonth() + 1, 1),
            )
          }
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.percent}>{summary.percent}%</Text>
        <Text style={styles.summaryText}>
          Present: {summary.totals.present}
        </Text>
        <Text style={styles.summaryText}>Absent: {summary.totals.absent}</Text>
        <Text style={styles.summaryText}>Late: {summary.totals.late}</Text>
        <Text style={styles.summaryText}>
          Half Day: {summary.totals.half_day}
        </Text>
      </View>

      <View>
        <View style={styles.weekHeader}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Text key={d} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {(() => {
            const year = current.getFullYear();
            const month = current.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const cells: any[] = [];
            // leading blanks
            for (let i = 0; i < firstDay; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++)
              cells.push(new Date(year, month, d));
            // render cells
            return cells.map((dt, idx) => {
              if (!dt) return <View key={`b${idx}`} style={styles.dayCell} />;
              const key = dt.toISOString().split("T")[0];
              const status = attendanceMap[key];
              const bg =
                status === "present"
                  ? "#16a34a"
                  : status === "absent"
                    ? "#dc2626"
                    : "#e5e7eb";
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.dayCell}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dayInner, { backgroundColor: bg }]}>
                    <Text style={styles.dayNumber}>{dt.getDate()}</Text>
                  </View>
                </TouchableOpacity>
              );
            });
          })()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthLabel: { fontSize: 16, fontWeight: "700" },
  summary: {
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 12,
  },
  percent: { fontSize: 28, fontWeight: "800" },
  summaryText: { fontSize: 14 },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekDay: { width: `${100 / 7}%`, textAlign: "center", fontWeight: "700" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: `${100 / 7}%`, padding: 6 },
  dayInner: { borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  dayNumber: { color: "#fff", fontWeight: "700" },
});
