import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

export default function ToggleTheme() {
  const { themeName, toggleTheme } = useTheme();
  return (
    <Pressable onPress={() => toggleTheme()} style={styles.btn}>
      <Text>{themeName === "dark" ? "Switch to Light" : "Switch to Dark"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ btn: { padding: 8 } });
