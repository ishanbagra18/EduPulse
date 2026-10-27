import { StyleSheet, View } from "react-native";
import { useTheme } from "../hooks/useTheme";

export default function Card({
  children,
  style,
}: {
  children: any;
  style?: any;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
});
