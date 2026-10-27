import { Link, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { usePendingFees } from "../../../../hooks/useFees";

export default function AdminFeesList() {
  const router = useRouter();
  const { data, isLoading } = usePendingFees();
  const [query, setQuery] = React.useState("");

  const filteredFees = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];

    return (data ?? []).filter((fee: any) => {
      const haystack = [
        fee.student_name,
        fee.student_email,
        fee.student_admission_number,
        fee.student_roll_number,
        fee.class_name,
        fee.month,
        fee.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, query]);

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Fees</Text>
        <Button
          title="Generate Fees"
          onPress={() => router.push("/(app)/admin/fees/create")}
        />
      </View>

      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Search student, class, month..."
        autoCapitalize="none"
      />

      <FlatList
        data={filteredFees}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.student_name}</Text>
              <Text style={styles.meta}>{item.class_name}</Text>
              <Text style={styles.meta}>
                {item.month} • {item.amount} • {item.status}
              </Text>
            </View>
            <Link
              href={{
                pathname: "/(app)/admin/fees/[id]",
                params: { id: String(item.id) },
              }}
            >
              <Text>View</Text>
            </Link>
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
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "600" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#dbe4ee",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#475569", marginTop: 2 },
});
