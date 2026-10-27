import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuthContext } from "../../hooks/AuthProvider";

function TopLeftMenu() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [visible, setVisible] = useState(false);

  const items: Array<{ label: string; route: string }> =
    user?.role === "admin"
      ? [
          { label: "Home", route: "/(app)" },
          { label: "Dashboard", route: "/(app)/admin/dashboard" },
          { label: "Users", route: "/(app)/admin/users" },
          { label: "Fees", route: "/(app)/admin/fees" },
          { label: "Classes", route: "/(app)/admin/classes" },
          { label: "Subjects", route: "/(app)/admin/subjects" },
          { label: "Notifications", route: "/(app)/admin/notifications" },
          { label: "Timetable", route: "/(app)/admin/timetable" },
          { label: "Profile", route: "/(app)/profile" },
        ]
      : user?.role === "teacher"
        ? [
            { label: "Home", route: "/(app)" },
            { label: "Attendance", route: "/(app)/teacher/attendance" },
            { label: "Timetable", route: "/(app)/teacher/timetable" },
            { label: "Profile", route: "/(app)/profile" },
          ]
        : [
            { label: "Home", route: "/(app)" },
            { label: "Attendance", route: "/(app)/student/attendance" },
            { label: "Timetable", route: "/(app)/student/timetable" },
            { label: "Fees", route: "/(app)/student/fees" },
            { label: "Notifications", route: "/(app)/student/notifications" },
            { label: "Profile", route: "/(app)/profile" },
          ];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.menuButton}
        hitSlop={10}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menuPanel}>
            <Text style={styles.menuTitle}>Menu</Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => {
                  setVisible(false);
                  router.push(item.route as any);
                }}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function ProtectedApp() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f172a",
        },
        headerTintColor: "#f8fafc",
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerLeft: () => <TopLeftMenu />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="search" options={{ title: "Search" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen
        name="profile/change-password"
        options={{ title: "Change Password" }}
      />
      <Stack.Screen name="profile/edit" options={{ title: "Edit Profile" }} />

      <Stack.Screen name="admin/dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="admin/users" options={{ title: "Users" }} />
      <Stack.Screen
        name="admin/users/create"
        options={{ title: "Create User" }}
      />
      <Stack.Screen
        name="admin/users/[id]"
        options={{ title: "User Details" }}
      />
      <Stack.Screen name="admin/fees" options={{ title: "Fees" }} />
      <Stack.Screen
        name="admin/fees/create"
        options={{ title: "Create Fee" }}
      />
      <Stack.Screen name="admin/fees/[id]" options={{ title: "Fee Details" }} />
      <Stack.Screen name="admin/classes" options={{ title: "Classes" }} />
      <Stack.Screen
        name="admin/classes/create"
        options={{ title: "Create Class" }}
      />
      <Stack.Screen
        name="admin/classes/[id]"
        options={{ title: "Class Details" }}
      />
      <Stack.Screen name="admin/subjects" options={{ title: "Subjects" }} />
      <Stack.Screen
        name="admin/subjects/create"
        options={{ title: "Create Subject" }}
      />
      <Stack.Screen
        name="admin/subjects/[id]"
        options={{ title: "Subject Details" }}
      />
      <Stack.Screen
        name="admin/notifications"
        options={{ title: "Notifications" }}
      />
      <Stack.Screen name="admin/timetable" options={{ title: "Timetable" }} />
      <Stack.Screen
        name="admin/notifications/create"
        options={{ title: "Create Notification" }}
      />

      <Stack.Screen name="student/timetable" options={{ title: "Timetable" }} />
      <Stack.Screen
        name="student/attendance"
        options={{ title: "Attendance" }}
      />
      <Stack.Screen name="student/fees" options={{ title: "Fees" }} />
      <Stack.Screen
        name="student/notifications"
        options={{ title: "Notifications" }}
      />

      <Stack.Screen
        name="teacher/attendance"
        options={{ title: "Attendance" }}
      />
      <Stack.Screen name="teacher/timetable" options={{ title: "Timetable" }} />
    </Stack>
  );
}

export default function AppLayout() {
  return <ProtectedApp />;
}

const styles = StyleSheet.create({
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  menuIcon: {
    color: "#f8fafc",
    fontSize: 26,
    lineHeight: 26,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  menuPanel: {
    width: 260,
    backgroundColor: "#ffffff",
    marginTop: 60,
    marginLeft: 10,
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
});
