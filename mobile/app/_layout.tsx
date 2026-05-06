import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f0f0f" },
          headerTintColor: "#f9fafb",
          contentStyle: { backgroundColor: "#0f0f0f" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="video/[id]" options={{ title: "Video Detail" }} />
      </Stack>
    </QueryClientProvider>
  );
}
