import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Visão geral", tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" color={String(color)} size={size} /> }}
      />
      {/* Próximas abas: lançamentos, planilhas, orçamentos */}
    </Tabs>
  );
}
