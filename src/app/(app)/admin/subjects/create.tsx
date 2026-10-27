import { Picker } from "@react-native-picker/picker";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useCreateSubject } from "../../../../hooks/useClassSubject";
import { fetchClasses } from "../../../../services/classes";
import { fetchTeachers } from "../../../../services/teachers";

export default function CreateSubject() {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const create = useCreateSubject();

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

  const onSubmit = async () => {
    try {
      await create.mutateAsync({
        name,
        code,
        class_id: classId || null,
        teacher_id: teacherId || null,
      });
      Alert.alert("Created");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Subject</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Code"
        style={styles.input}
        value={code}
        onChangeText={setCode}
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
