import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAllClasses } from "../../../../hooks/useClassSubject";
import {
    useCreateFee,
    useGenerateMonthlyFees,
} from "../../../../hooks/useFees";

export default function CreateFeeScreen() {
  const router = useRouter();
  const createFee = useCreateFee();
  const generateMonthlyFees = useGenerateMonthlyFees();
  const { data: classes = [] } = useAllClasses();

  const [studentId, setStudentId] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [status, setStatus] = React.useState("pending");
  const [selectedClassId, setSelectedClassId] = React.useState<string>("all");

  const onSubmit = async () => {
    if (!month.trim() || !amount.trim()) {
      Alert.alert("Missing fields", "Month and amount are required.");
      return;
    }

    try {
      if (studentId.trim()) {
        await createFee.mutateAsync({
          student_id: studentId.trim(),
          month: month.trim(),
          amount: Number(amount),
          due_date: dueDate.trim() || null,
          status: status || "pending",
        });
        Alert.alert("Created", "Fee entry created successfully.");
      } else {
        const class_id = selectedClassId === "all" ? null : selectedClassId;
        const res = await generateMonthlyFees.mutateAsync({
          month: month.trim(),
          amount: Number(amount),
          due_date: dueDate.trim() || null,
          class_id: class_id,
          student_id: null,
        });
        const count = Array.isArray(res?.data) ? res.data.length : 0;
        Alert.alert("Generated", `${count} fee entries created for ${month}.`);
      }
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Unable to create fee.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate fees</Text>
      <Text style={styles.helperText}>
        Leave student ID blank to generate fees for all active students, or
        choose a single class.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Student ID (optional)"
        value={studentId}
        onChangeText={setStudentId}
      />

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedClassId}
          onValueChange={(value: string | number) =>
            setSelectedClassId(String(value))
          }
        >
          <Picker.Item label="All active students" value="all" />
          {classes.map((schoolClass: any) => (
            <Picker.Item
              key={schoolClass.id}
              label={`${schoolClass.name}${schoolClass.section ? ` ${schoolClass.section}` : ""}`}
              value={schoolClass.id}
            />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Month (e.g. August 2026)"
        value={month}
        onChangeText={setMonth}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Due date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Status (pending/paid/partial)"
        value={status}
        onChangeText={setStatus}
      />
      <Button title="Generate fee entries" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  helperText: { color: "#475569", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#dbe4ee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#dbe4ee",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
});
