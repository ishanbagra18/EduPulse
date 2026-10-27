import { useQuery } from "@tanstack/react-query";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getCounts } from "../../../../services/admin";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<{
    totalStudents: number;
    totalTeachers: number;
    pendingFees: number;
    attendanceRecords: number;
  }>({
    queryKey: ["adminCounts"],
    queryFn: getCounts,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Dashboard overview</Text>
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Students</Text>
          <Text style={styles.cardValue}>{data?.totalStudents ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teachers</Text>
          <Text style={styles.cardValue}>{data?.totalTeachers ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Fees</Text>
          <Text style={styles.cardValue}>{data?.pendingFees ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance Records</Text>
          <Text style={styles.cardValue}>{data?.attendanceRecords ?? 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
});
