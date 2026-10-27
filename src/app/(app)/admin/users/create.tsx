import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useCreateUser } from "../../../../hooks/useUsers";
import supabase from "../../../../services/supabase";

export default function CreateUserScreen() {
  const router = useRouter();
  const createUser = useCreateUser();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState("student");

  const onSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Missing fields",
        "Full name, email, and password are required.",
      );
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (existing?.id) {
        Alert.alert("Already exists", "A user with this email already exists.");
        return;
      }

      await createUser.mutateAsync({
        email: email.trim(),
        password,
        profile: {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          is_active: true,
          is_blocked: false,
        },
      });

      Alert.alert("Created", `${role} account created successfully.`);
      router.replace("/(app)/admin/users");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Unable to create user.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create user</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={role}
          onValueChange={(value: string | number) => setRole(String(value))}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Teacher" value="teacher" />
        </Picker>
      </View>
      <Button title="Create user" onPress={onSubmit} />
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
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
});
