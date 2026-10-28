import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";

// Mostra o erro na tela (em vez de tela branca) se algo falhar ao abrir o banco ou renderizar.
export { ErrorBoundary } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Colors } from "@/src/constants/theme";
import { DATABASE_NAME, initDatabase } from "@/src/db";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
      <ActivityIndicator color={Colors.primary[500]} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase} useSuspense>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="novo-lancamento" options={{ presentation: "modal" }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
