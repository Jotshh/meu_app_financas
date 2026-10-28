import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Typography } from "@/src/constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const tabHeight = 56 + Math.max(insets.bottom, 8);
  const paddingBottom = Math.max(insets.bottom, 6);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      {/* 1. Visão geral */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Visão geral",
          tabBarAccessibilityLabel: "Visão geral",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size ?? 22} color={String(color)} />
          ),
        }}
      />

      {/* 2. Lançamentos */}
      <Tabs.Screen
        name="lancamentos"
        options={{
          title: "Lançamentos",
          tabBarAccessibilityLabel: "Lançamentos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size ?? 22} color={String(color)} />
          ),
        }}
      />

      {/* 3. Botão central de ação rápida (+) */}
      <Tabs.Screen
        name="novo"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Novo lançamento",
          tabBarButton: () => (
            <View style={styles.fabWrapper} pointerEvents="box-none">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Novo lançamento"
                onPress={() => router.push("/novo-lancamento")}
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
              >
                <Ionicons name="add" size={28} color={Colors.white} />
              </Pressable>
            </View>
          ),
        }}
      />

      {/* 4. Contas */}
      <Tabs.Screen
        name="contas"
        options={{
          title: "Contas",
          tabBarAccessibilityLabel: "Contas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size ?? 22} color={String(color)} />
          ),
        }}
      />

      {/* 5. Orçamentos */}
      <Tabs.Screen
        name="orcamentos"
        options={{
          title: "Orçamentos",
          tabBarAccessibilityLabel: "Orçamentos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" size={size ?? 22} color={String(color)} />
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    top: -14,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.button.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
