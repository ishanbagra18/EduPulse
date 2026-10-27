import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAllSubjects } from "../../../../hooks/useClassSubject";

export default function AdminSubjects() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAllSubjects();
  if (isLoading) return <ActivityIndicator />;
  if (isError)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Subjects</Text>
        <Text style={{ color: "#b91c1c" }}>
          Error: {String(error ?? "Unknown")}
        </Text>
      </View>
    );

  const list = data ?? [];

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>Subjects</Text>
        <Button
          title="Create"
          onPress={() => router.push("/admin/subjects/create" as any)}
        />
      </View>
      {list.length === 0 ? (
        <Text>No subjects found</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i: any) => String(i.id)}
          renderItem={({ item }: any) => (
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.name}>
                  {item.name} ({item.code})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/admin/subjects/${String(item.id)}` as any)
                }
              >
                <Text>Open</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
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
