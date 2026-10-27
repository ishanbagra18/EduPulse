import { Picker } from "@react-native-picker/picker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import {
  useClass,
  useCreateClass,
  useDeleteClass,
  useUpdateClass,
} from "../../../../hooks/useClassSubject";
import { fetchTeachers } from "../../../../services/teachers";

export default function ClassDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string | undefined;
  const { data: classItem, isLoading } = useClass(id);
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const createClass = useCreateClass();
  const [name, setName] = React.useState(classItem?.name ?? "");
  const [section, setSection] = React.useState(classItem?.section ?? "");
  const [academicYear, setAcademicYear] = React.useState(
    classItem?.academic_year ?? "",
  );
  const [teacherId, setTeacherId] = React.useState(
    classItem?.class_teacher_id ?? "",
  );

  const qc = useQueryClient();
  // load teachers for picker
  const { data: teachers } = useQuery({
    queryKey: ["teachersForPicker"],
    queryFn: async () => {
      const res = await fetchTeachers();
      return res.data ?? [];
    },
  });

  React.useEffect(() => {
    if (classItem) {
      setName(classItem.name ?? "");
      setSection(classItem.section ?? "");
      setAcademicYear(classItem.academic_year ?? "");
      setTeacherId(classItem.class_teacher_id ?? "");
    }
  }, [classItem]);

  if (isLoading) return <Text>Loading...</Text>;
  if (!classItem) return <Text>Class not found</Text>;

  const handleUpdate = async () => {
    try {
      await updateClass.mutateAsync({
        id: classItem.id,
        patch: {
          name: name.trim(),
          section: section.trim(),
          academic_year: academicYear.trim(),
        },
      });
      Alert.alert("Updated", "Class updated successfully.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Unable to update class.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete class", "Are you sure you want to delete this class?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClass.mutateAsync(classItem.id);
            Alert.alert("Deleted", "Class has been deleted.");
            router.back();
          } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Unable to delete class.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Class details</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Class name"
      />
      <TextInput
        style={styles.input}
        value={section}
        onChangeText={setSection}
        placeholder="Section"
      />
      <TextInput
        style={styles.input}
        value={academicYear}
        onChangeText={setAcademicYear}
        placeholder="Academic year"
      />
      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 6 }}>Class Teacher</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={teacherId}
            onValueChange={(v: string | number) => setTeacherId(String(v))}
          >
            <Picker.Item label="Select Class Teacher" value="" />
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
      <View style={{ height: 12 }} />
      <Button title="Save changes" onPress={handleUpdate} />
      <View style={{ height: 12 }} />
      <Button title="Delete class" onPress={handleDelete} color="#b91c1c" />
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
