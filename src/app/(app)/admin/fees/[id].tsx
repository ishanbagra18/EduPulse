import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import {
    useDeleteFee,
    useMarkFeePaid,
    useUpdateFee,
} from "../../../../hooks/useFees";
import supabase from "../../../../services/supabase";

async function fetchFeeById(id: string) {
  const { data } = await supabase
    .from("fees")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export default function FeeDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string | undefined;
  const { data: fee, isLoading } = useQuery<any | null>({
    queryKey: ["fee", id],
    queryFn: () => fetchFeeById(id!),
    enabled: !!id,
  });
  const markPaid = useMarkFeePaid();
  const updateFee = useUpdateFee();
  const deleteFee = useDeleteFee();
  const [studentId, setStudentId] = React.useState(fee?.student_id ?? "");
  const [amount, setAmount] = React.useState(String(fee?.amount ?? ""));
  const [dueDate, setDueDate] = React.useState(fee?.due_date ?? "");
  const [month, setMonth] = React.useState(fee?.month ?? "");
  const [status, setStatus] = React.useState(fee?.status ?? "pending");

  React.useEffect(() => {
    if (fee) {
      setStudentId(fee.student_id ?? "");
      setAmount(String(fee.amount ?? ""));
      setDueDate(fee.due_date ?? "");
      setMonth(fee.month ?? "");
      setStatus(fee.status ?? "pending");
    }
  }, [fee]);

  if (isLoading) return <Text>Loading...</Text>;
  if (!fee) return <Text>Fee not found</Text>;

  const onMarkPaid = async () => {
    try {
      const payment = { amount: fee.amount, method: "cash" };
      await markPaid.mutateAsync({ feeId: fee.id, payment });
      Alert.alert("Marked Paid");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  const handleUpdate = async () => {
    try {
      await updateFee.mutateAsync({
        id: fee.id,
        patch: {
          student_id: studentId,
          amount: Number(amount),
          due_date: dueDate,
          month,
          status,
        },
      });
      Alert.alert("Updated", "Fee details saved.");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete fee", "Are you sure you want to delete this fee?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFee.mutateAsync(fee.id);
            Alert.alert("Deleted", "Fee deleted.");
            router.back();
          } catch (err) {
            Alert.alert("Error", String(err));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fee Detail</Text>
      <TextInput
        placeholder="Student ID"
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
      />
      <TextInput
        placeholder="Month"
        style={styles.input}
        value={month}
        onChangeText={setMonth}
      />
      <TextInput
        placeholder="Amount"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Due date (YYYY-MM-DD)"
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TextInput
        placeholder="Status"
        style={styles.input}
        value={status}
        onChangeText={setStatus}
      />
      <Button title="Save changes" onPress={handleUpdate} />
      <View style={{ height: 12 }} />
      <Button title="Delete fee" onPress={handleDelete} color="#b91c1c" />
      <View style={{ height: 12 }} />
      {fee.status !== "paid" && (
        <Button title="Mark Paid (Cash)" onPress={onMarkPaid} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
