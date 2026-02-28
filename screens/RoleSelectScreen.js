import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>IL</Text>
          </View>
          <Text style={styles.title}>IDEALab</Text>
          <Text style={styles.subtitle}>Component Borrowing System</Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>Who are you?</Text>

        {/* Role Cards */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate("Login", { role: "student" })}
        >
          <Text style={styles.roleIcon}>👨‍🎓</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Student</Text>
            <Text style={styles.roleSubtitle}>Browse & request components</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.adminCard]}
          onPress={() => navigation.navigate("Login", { role: "admin" })}
        >
          <Text style={styles.roleIcon}>🛡️</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Admin</Text>
            <Text style={styles.roleSubtitle}>Manage inventory & requests</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    color: "#f1f5f9",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 6,
  },
  question: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: "center",
  },
  roleCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  adminCard: {
    borderColor: "#3b82f6",
  },
  roleIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  roleInfo: { flex: 1 },
  roleTitle: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "800",
  },
  roleSubtitle: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  arrow: {
    color: "#334155",
    fontSize: 28,
  },
});