import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TechniqueTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  text: { color: "#bfdbfe", fontSize: 12, fontWeight: "500" },
});
