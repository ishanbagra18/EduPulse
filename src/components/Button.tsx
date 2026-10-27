import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

type Props = React.ComponentProps<typeof Pressable> & { title: string };

export default function Button({ title, style, ...rest }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[
        styles.btn,
        { backgroundColor: theme.colors.primary },
        style as any,
      ]}
      {...rest}
    >
      <Text style={[styles.text, { color: "#fff" }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 12, borderRadius: 8, alignItems: "center" },
  text: { fontWeight: "600" },
});
