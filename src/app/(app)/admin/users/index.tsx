import { Link, useRouter } from "expo-router";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Avatar from "../../../../components/Avatar";
import { useUsers } from "../../../../hooks/useUsers";

export default function UsersList() {
  const router = useRouter();
  const { data, isLoading } = useUsers();
  const users = Array.isArray(data) ? data : [];

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Button
          title="New User"
          onPress={() => router.push("/(app)/admin/users/create")}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Avatar uri={item.profile_image} size={44} />
            <View style={styles.userText}>
              <Text style={styles.name}>{item.full_name ?? item.email}</Text>
              <Text style={styles.role}>{item.role}</Text>
              {item.is_active === false ? (
                <Text style={styles.status}>Pending approval</Text>
              ) : item.is_blocked ? (
                <Text style={styles.blockedStatus}>Blocked</Text>
              ) : (
                <Text style={styles.activeStatus}>Active</Text>
              )}
            </View>
            <Link
              href={{
                pathname: "/(app)/admin/users/[id]",
                params: { id: String(item.id) },
              }}
            >
              <Text>View</Text>
            </Link>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "600" },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userText: { flex: 1 },
  name: { fontSize: 16 },
  role: { color: "#666", marginTop: 2, textTransform: "capitalize" },
  status: { color: "#b45309", marginTop: 2, fontSize: 12 },
  activeStatus: { color: "#15803d", marginTop: 2, fontSize: 12 },
  blockedStatus: { color: "#b91c1c", marginTop: 2, fontSize: 12 },
});
