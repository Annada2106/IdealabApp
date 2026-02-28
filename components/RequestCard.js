import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RequestCard({ item }) {
  const getStatusColor = (status) => {
    if (status === "Borrowed") return "#22c55e";
    if (status === "Pending") return "#f59e0b";
    if (status === "Returned") return "#3b82f6";
    if (status === "Rejected") return "#ef4444";
    return "#64748b";
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.componentName}</Text>
        <Text style={styles.sub}>Qty: {item.quantity} • {item.purpose}</Text>
        <Text style={styles.sub}>Return by: {item.expectedReturn}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + "22" }]}>
        <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1 },
  name: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  sub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: "700" },
});