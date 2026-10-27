import { Button, StyleSheet, Text, View } from "react-native";
import ToggleTheme from "../../components/ToggleTheme";
import { useAuthContext } from "../../hooks/AuthProvider";

export default function Dashboard() {
  const { user, signOut } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome, {user?.full_name ?? user?.email}
      </Text>
      <ToggleTheme />
      <Text>Role: {user?.role}</Text>
      <View style={{ height: 12 }} />
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, marginBottom: 8 },
});
