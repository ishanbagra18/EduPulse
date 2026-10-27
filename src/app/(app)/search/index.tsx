import debounce from "lodash.debounce";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { globalSearch } from "../../../services/search";

export default function SearchScreen() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>({
    students: [],
    teachers: [],
    results: [],
    fees: [],
  });

  const doSearch = React.useRef(
    debounce(async (q: string) => {
      setLoading(true);
      const r = await globalSearch(q);
      setResults(r);
      setLoading(false);
    }, 400),
  ).current;

  React.useEffect(() => {
    doSearch(query);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search students, teachers, fees, subjects..."
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results.students}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => (
            <Text style={styles.item}>
              S: {item.admission_number ?? ""} {item.user_id}
            </Text>
          )}
          ListHeaderComponent={() => (
            <Text style={styles.section}>Students</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  section: { fontWeight: "600", marginTop: 8 },
  item: { padding: 8 },
});
