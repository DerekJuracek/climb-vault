import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Video } from "@/types";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLOR: Record<string, string> = {
  uploaded: "#6b7280",
  processing: "#eab308",
  analyzed: "#22c55e",
  failed: "#ef4444",
};

export default function VideoCard({ video }: { video: Video }) {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/video/${video.id}`)}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{video.title}</Text>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[video.status] }]} />
      </View>
      <View style={styles.meta}>
        {video.climb_grade && <Text style={styles.chip}>{video.climb_grade}</Text>}
        {video.location && <Text style={styles.chip}>{video.location}</Text>}
      </View>
      <Text style={styles.date}>
        {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: "#f9fafb", fontSize: 16, fontWeight: "600", flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  chip: {
    backgroundColor: "#1f2937",
    color: "#9ca3af",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  date: { color: "#6b7280", fontSize: 12, marginTop: 8 },
});
