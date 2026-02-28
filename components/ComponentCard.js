import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ComponentCard({ item, onRequest }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          Available: {item.available} / Total: {item.total}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, item.available === 0 && styles.disabledBtn]}
        onPress={() => onRequest(item)}
        disabled={item.available === 0}
      >
        <Text style={styles.btnText}>
          {item.available === 0 ? "Out" : "Request"}
        </Text>
      </TouchableOpacity>
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
  name: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  sub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  btn: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  disabledBtn: { backgroundColor: "#334155" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});