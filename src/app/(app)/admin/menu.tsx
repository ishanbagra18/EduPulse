import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MENU_ITEMS = [
  { label: "Dashboard", route: "/(app)/admin/dashboard" },
  { label: "Users", route: "/(app)/admin/users" },
  { label: "Fees", route: "/(app)/admin/fees" },
  { label: "Classes", route: "/(app)/admin/classes" },
  { label: "Subjects", route: "/(app)/admin/subjects" },
  { label: "Notifications", route: "/(app)/admin/notifications" },
  { label: "Timetable", route: "/(app)/admin/timetable" },
  { label: "Profile", route: "/(app)/profile" },
];

export default function AdminMenuScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin menu</Text>
      <View style={styles.list}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            activeOpacity={0.8}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.itemText}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 18,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  chevron: {
    fontSize: 24,
    color: "#64748b",
  },
});
