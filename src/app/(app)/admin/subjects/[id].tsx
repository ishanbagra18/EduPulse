import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import {
  useDeleteSubject,
  useSubject,
  useUpdateSubject,
} from "../../../../hooks/useClassSubject";
import { fetchClasses } from "../../../../services/classes";
import { fetchTeachers } from "../../../../services/teachers";

export default function SubjectDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string | undefined;
  const { data: subject, isLoading } = useSubject(id);
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const [name, setName] = React.useState(subject?.name ?? "");
  const [code, setCode] = React.useState(subject?.code ?? "");
  const [classId, setClassId] = React.useState(subject?.class_id ?? "");
  const [teacherId, setTeacherId] = React.useState(subject?.teacher_id ?? "");

  const { data: classes } = useQuery({
    queryKey: ["classesForPicker"],
    queryFn: async () => {
      const res = await fetchClasses();
      return res.data ?? [];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["teachersForPicker"],
    queryFn: async () => {
      const res = await fetchTeachers();
      return res.data ?? [];
    },
  });

  React.useEffect(() => {
    if (subject) {
      setName(subject.name ?? "");
      setCode(subject.code ?? "");
      setClassId(subject.class_id ?? "");
      setTeacherId(subject.teacher_id ?? "");
    }
  }, [subject]);

  if (isLoading) return <Text>Loading...</Text>;
  if (!subject) return <Text>Subject not found</Text>;

  const handleUpdate = async () => {
    try {
      await updateSubject.mutateAsync({
        id: subject.id,
        patch: {
          name: name.trim(),
          code: code.trim(),
          class_id: classId || null,
          teacher_id: teacherId || null,
        },
      });
      Alert.alert("Updated", "Subject updated successfully.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Unable to update subject.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete subject",
      "Are you sure you want to delete this subject?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubject.mutateAsync(subject.id);
              Alert.alert("Deleted", "Subject deleted successfully.");
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err?.message ?? "Unable to delete subject.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject details</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Subject name"
      />
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Subject code"
      />
      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 6 }}>Class (optional)</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={classId}
            onValueChange={(v: string | number) => setClassId(String(v))}
          >
            <Picker.Item label="Select Class" value="" />
            {(classes ?? []).map((c: any) => (
              <Picker.Item
                key={c.id}
                label={`${c.name}${c.section ? ` - ${c.section}` : ""}`}
                value={c.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 6 }}>Teacher (optional)</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={teacherId}
            onValueChange={(v: string | number) => setTeacherId(String(v))}
          >
            <Picker.Item label="Select Teacher" value="" />
            {(teachers ?? []).map((t: any) => (
              <Picker.Item
                key={t.id}
                label={t.users?.full_name ?? t.user_id}
                value={t.id}
              />
            ))}
          </Picker>
        </View>
      </View>
      <Button title="Save changes" onPress={handleUpdate} />
      <View style={{ height: 12 }} />
      <Button title="Delete subject" onPress={handleDelete} color="#b91c1c" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#dbe4ee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#dbe4ee",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
});
