import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  score: number | null;
}

export default function ScoreBar({ label, score }: Props) {
  if (score === null) return null;
  const pct = (score / 10) * 100;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.score, { color }]}>{score}/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  label: { color: "#9ca3af", width: 110, fontSize: 13 },
  track: { flex: 1, height: 8, backgroundColor: "#1f2937", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  score: { width: 36, textAlign: "right", fontSize: 13, fontWeight: "600" },
});
