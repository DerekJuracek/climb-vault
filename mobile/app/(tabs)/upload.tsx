import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUploadVideo } from "@/hooks/useVideos";
import { useRouter } from "expo-router";

export default function UploadScreen() {
  const router = useRouter();
  const { mutateAsync: upload, isPending } = useUploadVideo();

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) setVideoUri(result.assets[0].uri);
  };

  const handleUpload = async () => {
    if (!videoUri || !title.trim()) {
      Alert.alert("Missing fields", "Please select a video and enter a title.");
      return;
    }

    const formData = new FormData();
    // TODO: replace hardcoded athlete_id with auth context
    formData.append("athlete_id", "00000000-0000-0000-0000-000000000001");
    formData.append("title", title.trim());
    if (description) formData.append("description", description);
    if (grade) formData.append("climb_grade", grade);
    if (location) formData.append("location", location);
    formData.append("file", { uri: videoUri, name: "climb.mp4", type: "video/mp4" } as any);

    try {
      const video = await upload({ formData, onProgress: setProgress });
      Alert.alert("Uploaded!", "Your climb is being analyzed.");
      router.replace(`/video/${video.id}`);
    } catch {
      Alert.alert("Upload failed", "Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.picker} onPress={pickVideo}>
        <Text style={styles.pickerText}>{videoUri ? "Video selected" : "Select video from library"}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        placeholderTextColor="#4b5563"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Grade (e.g. V5, 5.11a)"
        placeholderTextColor="#4b5563"
        value={grade}
        onChangeText={setGrade}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#4b5563"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#4b5563"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      {isPending && (
        <View style={styles.progressRow}>
          <ActivityIndicator color="#3b82f6" />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.button, isPending && styles.buttonDisabled]} onPress={handleUpload} disabled={isPending}>
        <Text style={styles.buttonText}>{isPending ? "Uploading…" : "Upload & Analyze"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 12 },
  picker: {
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 4,
  },
  pickerText: { color: "#3b82f6", fontSize: 15 },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    padding: 14,
    color: "#f9fafb",
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressText: { color: "#9ca3af" },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
