import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import supabase from "../../../../services/supabase";

async function fetchNotifications() {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default function AdminNotifications() {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["adminNotifications"],
    queryFn: fetchNotifications,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Link href="/(app)/admin/notifications/create">
          <Text>Create</Text>
        </Link>
      </View>
      <FlatList
        data={data}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Text>{item.message}</Text>
          </View>
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
  },
  title: { fontSize: 20, fontWeight: "600" },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 16 },
});
