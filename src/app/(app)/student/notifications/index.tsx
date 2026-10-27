import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import { useNotificationsForUser } from "../../../../hooks/useNotifications";

export default function StudentNotifications() {
  const { user } = useAuthContext();
  const { data, isLoading } = useNotificationsForUser(user);

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
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
  title: { fontSize: 20, marginBottom: 12 },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  name: { fontSize: 16 },
});
