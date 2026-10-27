import { Image, StyleSheet } from "react-native";

export default function Avatar({
  uri,
  size = 48,
}: {
  uri?: string;
  size?: number;
}) {
  return (
    <Image
      source={uri ? { uri } : require("../../assets/images/icon.png")}
      style={[
        styles.img,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({ img: { backgroundColor: "#ddd" } });
