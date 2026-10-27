import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../../../../components/Avatar";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import {
  manualSync,
  useAttendanceForClassDate,
  useClasses,
  useStudentsForClass,
  useSubmitAttendance,
} from "../../../../hooks/useAttendance";
import supabase from "../../../../services/supabase";

type AttendanceStatus = "present" | "absent";

export default function AttendanceScreen() {
  const { data: classes, isLoading: loadingClasses } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    undefined,
  );
  const { data: students, isLoading: loadingStudents } =
    useStudentsForClass(selectedClass);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateKey = date.toISOString().split("T")[0];
  const { data: classAttendance, isLoading: loadingClassAttendance } =
    useAttendanceForClassDate(selectedClass, dateKey as any);
  const submit = useSubmitAttendance();
  const { user } = useAuthContext();

  const [localStatuses, setLocalStatuses] = useState<
    Record<string, AttendanceStatus>
  >({});

  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (classAttendance && (classAttendance as any[]).length > 0) {
      const map: Record<string, AttendanceStatus> = {};
      for (const a of classAttendance as any[]) {
        map[a.student_id] = (a.status as AttendanceStatus) || "absent";
      }
      setLocalStatuses(map);
      return;
    }
    if (students && (students as any[]).length > 0) {
      const m: Record<string, AttendanceStatus> = {};
      for (const s of students as any[]) m[s.id] = "present";
      setLocalStatuses(m);
      return;
    }
    setLocalStatuses({});
  }, [classAttendance, students]);

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return setTeacherId(null);
        const { data } = await supabase
          .from("teachers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        setTeacherId(data?.id ?? null);
      } catch (e) {
        setTeacherId(null);
      }
    })();
  }, [user]);

  if (loadingClasses) return <ActivityIndicator />;

  const toggleStatus = (studentId: string) => {
    const curr = localStatuses[studentId] ?? "present";
    const next: AttendanceStatus = curr === "present" ? "absent" : "present";
    setLocalStatuses({ ...localStatuses, [studentId]: next });
  };

  const handleSubmit = async () => {
    if (!selectedClass) return Alert.alert("Select class first");
    if (!students || students.length === 0)
      return Alert.alert("No students in class");

    const entries = students.map((s: any) => ({
      student_id: s.id,
      class_id: selectedClass,
      teacher_id: teacherId ?? null,
      date: date.toISOString().split("T")[0],
      status: localStatuses[s.id] ?? "present",
      remarks: null,
    }));

    try {
      const res = await submit.mutateAsync(entries);
      if (res.offline)
        Alert.alert("Saved offline", `${res.count} records queued for sync`);
      else
        Alert.alert(
          "Success",
          `${res.inserted ?? 0} attendance records submitted`,
        );
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take Attendance</Text>

      <View style={styles.row}>
        <Text>Class:</Text>
        <Picker
          selectedValue={selectedClass}
          style={{ flex: 1 }}
          onValueChange={(v: string | undefined) => setSelectedClass(v)}
        >
          <Picker.Item label="Select class" value={undefined} />
          {classes?.map((c: any) => (
            <Picker.Item
              key={c.id}
              label={`${c.name} ${c.section ? "-" + c.section : ""}`}
              value={c.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <Text>Date:</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{ marginLeft: 12 }}
        >
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(_event: any, d?: Date) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}
      </View>

      {loadingStudents || loadingClassAttendance ? (
        <ActivityIndicator />
      ) : (
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.colRoll]}>Roll</Text>
            <Text style={[styles.cell, styles.colName]}>Name</Text>
            <Text style={[styles.cell, styles.colStatus]}>Status</Text>
          </View>
          {students?.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.studentRow}
              onPress={() => toggleStatus(item.id)}
            >
              <Text style={[styles.cell, styles.colRoll]}>
                {item.roll_number ?? item.admission_number ?? "-"}
              </Text>
              <View
                style={[
                  styles.cell,
                  styles.colName,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Avatar uri={item.photo_url} size={36} />
                <Text style={{ marginLeft: 8 }}>
                  {item.users?.full_name ?? item.user_id}
                </Text>
              </View>
              <Text style={[styles.cell, styles.colStatus]}>
                {localStatuses[item.id] ?? "present"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <Button title="Submit Attendance" onPress={handleSubmit} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Button
          title="Sync Queue Now"
          onPress={async () => {
            const r = await manualSync();
            Alert.alert("Sync result", `Synced: ${r.synced ?? 0}`);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  studentRow: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  cell: { paddingVertical: 8 },
  colRoll: { width: 80 },
  colName: { flex: 1, paddingLeft: 8 },
  colStatus: { width: 100, textAlign: "center" },
});
