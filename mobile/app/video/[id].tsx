import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useVideo, useAnalysis, useSimilarVideos, useUpdateCoachNotes } from "@/hooks/useVideos";
import ScoreBar from "@/components/ScoreBar";
import TechniqueTag from "@/components/TechniqueTag";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: video, isLoading: videoLoading } = useVideo(id);
  const { data: analysis, isLoading: analysisLoading } = useAnalysis(id);
  const { data: similar } = useSimilarVideos(id);
  const { mutateAsync: saveNotes, isPending: savingNotes } = useUpdateCoachNotes(id);

  const [notesInput, setNotesInput] = useState<string | null>(null);

  if (videoLoading) return <ActivityIndicator style={styles.center} color="#3b82f6" />;
  if (!video) return <Text style={styles.error}>Video not found.</Text>;

  const currentNotes = notesInput ?? analysis?.coach_notes ?? "";

  const handleSaveNotes = async () => {
    try {
      await saveNotes({ notes: currentNotes });
      Alert.alert("Saved", "Coach notes updated.");
    } catch {
      Alert.alert("Error", "Could not save notes.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>{video.title}</Text>
      <View style={styles.metaRow}>
        {video.climb_grade && <Text style={styles.chip}>{video.climb_grade}</Text>}
        {video.location && <Text style={styles.chip}>{video.location}</Text>}
        <Text style={[styles.chip, { textTransform: "capitalize" }]}>{video.status}</Text>
      </View>

      {/* Processing state */}
      {(video.status === "uploaded" || video.status === "processing") && (
        <View style={styles.processingCard}>
          <ActivityIndicator color="#eab308" />
          <Text style={styles.processingText}>Analyzing with Gemini…</Text>
        </View>
      )}

      {/* Analysis */}
      {analysisLoading && video.status === "analyzed" && <ActivityIndicator color="#3b82f6" />}
      {analysis && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movement Summary</Text>
            <Text style={styles.summary}>{analysis.movement_summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scores</Text>
            <ScoreBar label="Footwork" score={analysis.footwork_score} />
            <ScoreBar label="Body Position" score={analysis.body_position_score} />
            <ScoreBar label="Balance" score={analysis.balance_score} />
          </View>

          {analysis.technique_tags?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Techniques</Text>
              <View style={styles.tagRow}>
                {analysis.technique_tags.map((t) => <TechniqueTag key={t} label={t} />)}
              </View>
            </View>
          ) : null}

          {analysis.key_moments?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Moments</Text>
              {analysis.key_moments.map((m, i) => (
                <View key={i} style={styles.moment}>
                  <Text style={styles.momentTime}>{m.timestamp_seconds}s</Text>
                  <Text style={styles.momentDesc}>{m.description}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Coach Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coach Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add coaching feedback…"
              placeholderTextColor="#4b5563"
              value={currentNotes}
              onChangeText={setNotesInput}
              multiline
              numberOfLines={5}
            />
            <TouchableOpacity style={[styles.button, savingNotes && styles.buttonDisabled]} onPress={handleSaveNotes} disabled={savingNotes}>
              <Text style={styles.buttonText}>{savingNotes ? "Saving…" : "Save Notes"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Similar Videos */}
      {similar?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Climbs</Text>
          {similar.map((s) => (
            <View key={s.video_id} style={styles.similarRow}>
              <Text style={styles.similarTitle}>{s.title}</Text>
              {s.climb_grade && <Text style={styles.chip}>{s.climb_grade}</Text>}
              <Text style={styles.similarity}>{Math.round(s.similarity * 100)}% match</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#ef4444", textAlign: "center", marginTop: 32 },
  title: { color: "#f9fafb", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  chip: { backgroundColor: "#1f2937", color: "#9ca3af", fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  processingCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1f2937", borderRadius: 10, padding: 16, marginBottom: 16 },
  processingText: { color: "#eab308", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#9ca3af", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  summary: { color: "#d1d5db", fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  moment: { flexDirection: "row", gap: 10, marginBottom: 6 },
  momentTime: { color: "#3b82f6", fontSize: 13, width: 36 },
  momentDesc: { color: "#d1d5db", fontSize: 13, flex: 1 },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 12, color: "#f9fafb", fontSize: 14 },
  textArea: { height: 120, textAlignVertical: "top" },
  button: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 13, alignItems: "center", marginTop: 10 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  similarRow: { backgroundColor: "#111827", borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  similarTitle: { color: "#f9fafb", fontSize: 14, flex: 1 },
  similarity: { color: "#22c55e", fontSize: 12 },
});
