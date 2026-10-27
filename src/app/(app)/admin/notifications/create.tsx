import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import { useCreateNotification } from "../../../../hooks/useNotifications";

export default function CreateNotification() {
  const { user } = useAuthContext();
  const create = useCreateNotification();
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [targetRole, setTargetRole] = React.useState("everyone");

  const onSubmit = async () => {
    try {
      await create.mutateAsync({
        title,
        message,
        target_role: targetRole,
        created_by: user?.id,
      });
      Alert.alert("Created");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Notification</Text>
      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Message"
        style={[styles.input, { height: 120 }]}
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <Picker
        selectedValue={targetRole}
        onValueChange={(v: string) => setTargetRole(v)}
      >
        <Picker.Item label="Everyone" value="everyone" />
        <Picker.Item label="Students" value="student" />
        <Picker.Item label="Teachers" value="teacher" />
      </Picker>
      <View style={{ height: 8 }} />
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
});
