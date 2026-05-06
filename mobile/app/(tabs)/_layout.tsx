import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1f2937" },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        headerStyle: { backgroundColor: "#0f0f0f" },
        headerTintColor: "#f9fafb",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Library", tabBarLabel: "Library" }} />
      <Tabs.Screen name="upload" options={{ title: "Upload", tabBarLabel: "Upload" }} />
      <Tabs.Screen name="athletes" options={{ title: "Athletes", tabBarLabel: "Athletes" }} />
    </Tabs>
  );
}
