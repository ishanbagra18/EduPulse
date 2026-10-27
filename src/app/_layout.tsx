import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Providers from "../providers";

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0f172a",
          },
          headerTintColor: "#f8fafc",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#f8fafc",
          },
        }}
      >
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name="signup"
          options={{ title: "Create Account", headerShown: false }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{ title: "Forgot Password" }}
        />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
