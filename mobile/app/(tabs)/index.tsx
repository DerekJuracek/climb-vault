import React from "react";
import { FlatList, ActivityIndicator, Text, StyleSheet, View } from "react-native";
import { useVideos } from "@/hooks/useVideos";
import VideoCard from "@/components/VideoCard";

export default function LibraryScreen() {
  const { data: videos, isLoading, error } = useVideos();

  if (isLoading) return <ActivityIndicator style={styles.center} color="#3b82f6" />;
  if (error) return <Text style={styles.error}>Failed to load videos.</Text>;
  if (!videos?.length)
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No climbs yet — upload your first one!</Text>
      </View>
    );

  return (
    <FlatList
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => <VideoCard video={item} />}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#ef4444", textAlign: "center", marginTop: 32 },
  empty: { color: "#6b7280", fontSize: 15 },
});
