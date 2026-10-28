import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/src/components/Button";
import Chip from "@/src/components/Chip";
import { Colors, Radius, Spacing, Typography } from "@/src/constants/theme";

type TransactionKind = "expense" | "income" | "transfer";

export default function NovoLancamentoModal() {
  const [kind, setKind] = useState<TransactionKind>("expense");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Novo lançamento</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.typeSelector}>
          <Chip
            label="Despesa"
            selected={kind === "expense"}
            onPress={() => setKind("expense")}
          />
          <Chip
            label="Receita"
            selected={kind === "income"}
            onPress={() => setKind("income")}
          />
          <Chip
            label="Transferência"
            selected={kind === "transfer"}
            onPress={() => setKind("transfer")}
          />
        </View>

        <View style={styles.placeholderCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="construct-outline" size={32} color={Colors.textSecondary} />
          </View>
          <Text style={styles.placeholderTitle}>Formulário em desenvolvimento</Text>
          <Text style={styles.placeholderDesc}>
            O cadastro detalhado de lançamentos com valor, conta, categoria, parcelamento e anexos
            será integrado na próxima etapa.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button label="Fechar" onPress={() => router.back()} variant="primary" fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[4],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing[2],
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[6],
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[3],
    marginVertical: "auto",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  placeholderDesc: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  footer: {
    marginTop: "auto",
    paddingTop: Spacing[4],
  },
});

