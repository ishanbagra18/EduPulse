import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Avatar from "../../../components/Avatar";
import { useAuthContext } from "../../../hooks/AuthProvider";

export default function Profile() {
  const { user } = useAuthContext();
  return (
    <View style={styles.container}>
      <Avatar uri={user?.profile_image} size={96} />
      <View style={{ height: 12 }} />
      <Text style={styles.title}>{user?.full_name}</Text>
      <Text>{user?.email}</Text>
      <View style={{ height: 12 }} />
      <Link href="/(app)/profile/edit">
        <Text>Edit Profile</Text>
      </Link>
      <View style={{ height: 8 }} />
      <Link href="/(app)/profile/change-password">
        <Text>Change Password</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center" },
  title: { fontSize: 20, marginBottom: 8 },
});
