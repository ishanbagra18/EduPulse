import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useAllClasses,
  useAllSubjects,
} from "../../../../hooks/useClassSubject";
import supabase from "../../../../services/supabase";
import * as TeachersService from "../../../../services/teachers";

export default function AdminTimetable() {
  const [managingClass, setManagingClass] = React.useState<string | null>(null);
  const [picker, setPicker] = React.useState<{
    type: string | null;
    visible: boolean;
  }>({ type: null, visible: false });

  // form state
  const [form, setForm] = React.useState<any>({
    id: null,
    class_id: "",
    subject_id: "",
    teacher_id: "",
    day: "",
    start_time: "",
    end_time: "",
    room: "",
  });

  const { data: classes, isLoading: loadingClasses } = useAllClasses();
  const { data: subjects, isLoading: loadingSubjects } = useAllSubjects();
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ["teachersAll"],
    queryFn: async () => {
      const { data } = await TeachersService.fetchTeachers();
      return data ?? [];
    },
  });

  const timetableQuery = useQuery({
    queryKey: ["timetable", { class_id: managingClass }],
    queryFn: async () => {
      if (!managingClass) return [];
      const { data } = await supabase
        .from("timetable")
        .select("*, classes(*), subjects(*), teachers(*, users(*))")
        .eq("class_id", managingClass);
      return data ?? [];
    },
    enabled: !!managingClass,
  });

  const resetForm = () => {
    setForm({
      id: null,
      class_id: managingClass || "",
      subject_id: "",
      teacher_id: "",
      day: "",
      start_time: "",
      end_time: "",
      room: "",
    });
  };

  const openPicker = (type: string) => {
    setPicker({ type, visible: true });
  };

  const selectPickerValue = (value: any) => {
    if (picker.type === "subject") {
      setForm((s: any) => ({ ...s, subject_id: value }));
    } else if (picker.type === "teacher") {
      setForm((s: any) => ({ ...s, teacher_id: value }));
    } else if (picker.type === "class") {
      setForm((s: any) => ({ ...s, class_id: value }));
    }
    setPicker({ type: null, visible: false });
  };

  const handleSave = async () => {
    try {
      const payload = {
        class_id: form.class_id,
        subject_id: form.subject_id,
        teacher_id: form.teacher_id,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room,
      };
      if (form.id) {
        const { data, error } = await supabase
          .from("timetable")
          .update(payload)
          .eq("id", form.id)
          .select()
          .single();
        if (error) throw error;
        Alert.alert("Updated");
      } else {
        const { data, error } = await supabase
          .from("timetable")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        Alert.alert("Created");
      }
      resetForm();
      timetableQuery.refetch();
    } catch (err: any) {
      Alert.alert("Error", String(err));
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      id: item.id,
      class_id: item.class_id,
      subject_id: item.subject_id,
      teacher_id: item.teacher_id,
      day: item.day,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room,
    });
  };

  const handleDelete = (id: any) => {
    Alert.alert("Delete entry", "This will remove the entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("timetable")
              .delete()
              .eq("id", id);
            if (error) throw error;
            Alert.alert("Deleted");
            timetableQuery.refetch();
          } catch (err: any) {
            Alert.alert("Error", String(err));
          }
        },
      },
    ]);
  };

  const loading =
    loadingClasses ||
    loadingSubjects ||
    loadingTeachers ||
    timetableQuery.isLoading;

  if (loading && !managingClass) return <ActivityIndicator />;

  // Initial view: choose class to manage
  if (!managingClass)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Choose class to manage timetable</Text>
        {loadingClasses ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(i: any) => String(i.id)}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  setManagingClass(item.id);
                  setForm((s: any) => ({ ...s, class_id: item.id }));
                }}
              >
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.section ?? ""}</Text>
                </View>
                <Text style={{ color: "#0f172a" }}>Manage ›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );

  // Manage view for a specific class
  const entries = timetableQuery.data ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text style={styles.title}>
          Timetable — manage class {managingClass}
        </Text>

        <View style={styles.form}>
          <TouchableOpacity onPress={() => openPicker("subject")}>
            <Text style={styles.pickerLabel}>
              Subject: {form.subject_id || "Choose subject"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker("teacher")}>
            <Text style={styles.pickerLabel}>
              Teacher: {form.teacher_id || "Choose teacher"}
            </Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Day (e.g. Monday)"
            style={styles.input}
            value={form.day}
            onChangeText={(v) => setForm((s: any) => ({ ...s, day: v }))}
          />
          <TextInput
            placeholder="Start time (HH:MM)"
            style={styles.input}
            value={form.start_time}
            onChangeText={(v) => setForm((s: any) => ({ ...s, start_time: v }))}
          />
          <TextInput
            placeholder="End time (HH:MM)"
            style={styles.input}
            value={form.end_time}
            onChangeText={(v) => setForm((s: any) => ({ ...s, end_time: v }))}
          />
          <TextInput
            placeholder="Room"
            style={styles.input}
            value={form.room}
            onChangeText={(v) => setForm((s: any) => ({ ...s, room: v }))}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button title={form.id ? "Save" : "Create"} onPress={handleSave} />
            <Button title="Reset" onPress={resetForm} />
            <Button
              title="Back"
              onPress={() => {
                setManagingClass(null);
                resetForm();
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: 16, flex: 1 }}>
          <Text style={styles.entriesTitle}>Timetable Entries</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No timetable entries yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(i: any) => String(i.id)}
              renderItem={({ item }: any) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectText}>
                        {item.subjects?.name ?? item.subject_id}
                      </Text>
                      <Text style={styles.metaText}>Subject</Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#0f172a",
                        paddingVertical: 4,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {item.day}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Teacher:</Text>
                      <Text style={styles.infoValue}>
                        {item.teachers?.users?.full_name ??
                          item.teachers?.full_name ??
                          item.teacher_id}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Class:</Text>
                      <Text style={styles.infoValue}>
                        {item.classes
                          ? `${item.classes.name}${item.classes.section ? ` ${item.classes.section}` : ""}`
                          : item.class_id}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Time:</Text>
                      <Text style={styles.infoValue}>
                        {item.start_time?.slice(0, 5)} -{" "}
                        {item.end_time?.slice(0, 5)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Room:</Text>
                      <Text style={styles.infoValue}>
                        {item.room ?? "Not specified"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={picker.visible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPicker({ type: null, visible: false })}
        >
          <View style={styles.modalPanel}>
            <Text style={styles.menuTitle}>Select {picker.type}</Text>
            <FlatList
              data={
                picker.type === "class"
                  ? classes
                  : picker.type === "subject"
                    ? subjects
                    : teachers
              }
              keyExtractor={(i: any) => String(i.id)}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => selectPickerValue(item.id ?? item)}
                >
                  <Text style={styles.menuItemText}>
                    {item.name ?? item.users?.full_name ?? item.id}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  title: { fontSize: 20, fontWeight: "600", color: "#0f172a" },
  entriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  form: {
    marginTop: 12,
    gap: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  pickerLabel: {
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
    color: "#1e293b",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPanel: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a",
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6 },
  menuItemText: { fontSize: 16, color: "#1e293b" },

  // Card styles
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#0f172a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardContent: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    width: "30%",
  },
  infoValue: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  metaText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "400",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e0f2fe",
    borderRadius: 6,
  },
  editButtonText: {
    color: "#0284c7",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // Old table styles (kept for reference, can be removed if not used elsewhere)
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "600" },
  sub: { color: "#64748b" },
});
