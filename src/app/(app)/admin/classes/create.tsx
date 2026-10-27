import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useCreateClass } from "../../../../hooks/useClassSubject";
import { fetchTeachers } from "../../../../services/teachers";

export default function CreateClass() {
  const [name, setName] = React.useState("");
  const [section, setSection] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const create = useCreateClass();

  const { data: teachers } = useQuery({
    queryKey: ["teachersForPicker"],
    queryFn: async () => {
      const res = await fetchTeachers();
      return res.data ?? [];
    },
  });

  const onSubmit = async () => {
    try {
      await create.mutateAsync({
        name,
        section,
        class_teacher_id: teacherId || null,
      });
      Alert.alert("Created");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Class</Text>
      <TextInput
        placeholder="Class name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Section"
        style={styles.input}
        value={section}
        onChangeText={setSection}
      />
      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 6 }}>Class Teacher (optional)</Text>
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

      <Button title="Create" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
});
