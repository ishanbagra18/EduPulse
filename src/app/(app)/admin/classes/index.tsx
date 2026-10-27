import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAllClasses } from "../../../../hooks/useClassSubject";

export default function AdminClasses() {
  const router = useRouter();
  const { data, isLoading } = useAllClasses();
  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Classes</Text>
        <Link href="/(app)/admin/classes/create">
          <Text>Create</Text>
        </Link>
      </View>
      <FlatList
        data={data}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.name}>
                {item.name} {item.section ? `- ${item.section}` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push(`/admin/classes/${String(item.id)}` as any)
              }
            >
              <Text>Open</Text>
            </TouchableOpacity>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: { flex: 1 },
  name: { fontSize: 16 },
});
