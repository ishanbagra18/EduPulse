import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthContext } from "../../../../hooks/AuthProvider";
import { useMarkFeePaid, useStudentFees } from "../../../../hooks/useFees";
import { fetchStudentByUserId } from "../../../../services/fees";

export default function StudentFees() {
  const { user } = useAuthContext();
  const { data: studentData, isLoading: loadingStudent } = useQuery<any>({
    queryKey: ["studentRecord", user?.id],
    queryFn: () => fetchStudentByUserId(user!.id),
    enabled: !!user?.id,
  });
  const studentId = studentData?.data?.id;
  const { data: fees, isLoading: loadingFees } = useStudentFees(studentId);
  const markFeePaid = useMarkFeePaid();

  if (loadingStudent || loadingFees) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Fees</Text>
      <FlatList
        data={fees}
        keyExtractor={(i: any) => i.id}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text>
                Month: {item.month} | Amount: {item.amount}
              </Text>
              <Text>Status: {item.status}</Text>
            </View>
            <Button
              title={item.status === "paid" ? "Paid" : "Pay"}
              disabled={item.status === "paid"}
              onPress={async () => {
                try {
                  Alert.alert("Debug", `Starting payment for fee ${item.id}`);
                  const amount = Number(item.amount) || 0;
                  const result: any = await markFeePaid.mutateAsync({
                    feeId: item.id,
                    payment: { amount, method: "razorpay" },
                  });
                  console.log("markFeePaid.mutateAsync result:", result);

                  if (result?.status === "pending_webhook") {
                    const sessionType = result?.sessionResult?.type;
                    if (sessionType === "success") {
                      Alert.alert(
                        "Payment",
                        "Returned from payment gateway. Payment may be completed — the server will confirm shortly.",
                      );
                    } else if (sessionType === "dismiss") {
                      Alert.alert(
                        "Payment",
                        "Payment window was closed. If you completed payment, wait a moment for confirmation.",
                      );
                    } else {
                      Alert.alert(
                        "Payment",
                        "Redirecting to payment gateway. Complete payment in the browser.",
                      );
                    }
                  } else {
                    Alert.alert("Payment", "Payment successful");
                  }
                } catch (err: any) {
                  console.error("markFeePaid error:", err);
                  Alert.alert(
                    "Payment failed",
                    err?.message ?? "Unknown error",
                  );
                }
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  row: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
