import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

export default function AthletesScreen() {
  const qc = useQueryClient();
  const { data: athletes, isLoading } = useQuery({ queryKey: ["athletes"], queryFn: api.listAthletes });
  const { mutateAsync: create, isPending } = useMutation({
    mutationFn: api.createAthlete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["athletes"] }),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      await create({ name: name.trim(), email: email.trim() });
      setName(""); setEmail(""); setShowForm(false);
    } catch {
      Alert.alert("Error", "Could not create athlete.");
    }
  };

  return (
    <View style={styles.container}>
      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#4b5563" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#4b5563" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={isPending}>
            <Text style={styles.buttonText}>{isPending ? "Saving…" : "Add Athlete"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={athletes}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm((v) => !v)}>
        <Text style={styles.fabText}>{showForm ? "✕" : "+"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 12, color: "#f9fafb" },
  button: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 13, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  name: { color: "#f9fafb", fontSize: 15, fontWeight: "500" },
  email: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3b82f6",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
});
