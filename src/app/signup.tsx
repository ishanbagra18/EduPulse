import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as z from "zod";
import supabase from "../services/supabase";

export const options = {
  headerShown: false,
};

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(7, "Phone number is required"),
  role: z.enum(["student", "teacher"]),
});

type FormValues = z.infer<typeof schema>;

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "student",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Prevent duplicate email entries in users table
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", values.email)
        .maybeSingle();

      if (existing && existing.id) {
        Alert.alert(
          "Email already registered",
          "An account with this email already exists. Please sign in or use a different email.",
        );
        setIsSubmitting(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        Alert.alert("Signup failed", authError.message ?? "Please try again.");
        setIsSubmitting(false);
        return;
      }

      const uid = authData?.user?.id;
      if (!uid) {
        Alert.alert(
          "Signup failed",
          "Unable to create your account. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      const { error: profileError } = await supabase.from("users").insert({
        id: uid,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        is_active: false,
        is_blocked: false,
      });

      if (profileError) {
        Alert.alert(
          "Signup failed",
          "Your account was created but profile setup failed. Please contact the admin.",
        );
        setIsSubmitting(false);
        return;
      }

      Alert.alert(
        "Account submitted",
        "Your account is pending admin approval. You will be able to log in after approval.",
      );
      router.replace("/login");
    } catch (err: any) {
      Alert.alert("Signup failed", err?.message ?? "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 28 + keyboardHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerContainer}>
            <View style={styles.formCard}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Student or teacher signup is pending admin approval.
              </Text>

              <Controller
                control={control}
                name="fullName"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <View style={styles.fieldWrap}>
                    <TextInput
                      placeholder="Full name"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      placeholderTextColor="#94a3b8"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <View style={styles.fieldWrap}>
                    <TextInput
                      placeholder="Email"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#94a3b8"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <View style={styles.fieldWrap}>
                    <TextInput
                      placeholder="Password"
                      style={[styles.input, error && styles.inputError]}
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      placeholderTextColor="#94a3b8"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <View style={styles.fieldWrap}>
                    <TextInput
                      placeholder="Phone number"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      placeholderTextColor="#94a3b8"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="role"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <View style={styles.fieldWrap}>
                    <View style={styles.roleRow}>
                      {(["student", "teacher"] as const).map((option) => (
                        <Button
                          key={option}
                          title={option}
                          onPress={() => onChange(option)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </View>
                    <Text style={styles.selectedRole}>Selected: {value}</Text>
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.buttonWrap}>
                {isSubmitting && (
                  <ActivityIndicator
                    size="small"
                    color="#2563eb"
                    style={{ marginBottom: 8 }}
                  />
                )}
                <Button
                  title={
                    isSubmitting ? "Creating account..." : "Create account"
                  }
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                />
              </View>

              <View style={{ height: 12 }} />
              <Button
                title="Back to sign in"
                onPress={() => router.replace("/login")}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eff6ff" },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    textAlign: "center",
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  selectedRole: {
    color: "#334155",
    fontSize: 13,
    marginBottom: 8,
  },
  fieldWrap: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 4,
  },
  buttonWrap: {
    marginTop: 8,
  },
});
