import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuthContext } from "../../../hooks/AuthProvider";
import supabase from "../../../services/supabase";

export default function ChangePassword() {
  const { user } = useAuthContext();
  const [current, setCurrent] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onChange = async () => {
    try {
      const res = await supabase.auth.updateUser({ password });
      if (res.error) throw res.error;
      Alert.alert("Password updated");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        placeholder="New password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Update" onPress={onChange} />
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
