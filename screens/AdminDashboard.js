import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function AdminDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalComponents: 0,
    pendingRequests: 0,
    activeBorrows: 0,
    totalReturned: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const compSnap = await getDocs(collection(db, "components"));
      const totalComponents = compSnap.size;

      const transSnap = await getDocs(collection(db, "transactions"));
      const allTrans = transSnap.docs.map((d) => d.data());

      const pendingRequests = allTrans.filter((t) => t.status === "Pending").length;
      const activeBorrows = allTrans.filter((t) => t.status === "Borrowed" || t.status === "Approved").length;
      const totalReturned = allTrans.filter((t) => t.status === "Returned").length;

      setStats({ totalComponents, pendingRequests, activeBorrows, totalReturned });
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const menuItems = [
    {
      icon: "📦",
      title: "Inventory",
      subtitle: "Manage components & stock",
      screen: "Inventory",
      color: "#3b82f6",
    },
    {
      icon: "📥",
      title: "Requests",
      subtitle: "Approve or reject borrow requests",
      screen: "Requests",
      color: "#f59e0b",
      badge: stats.pendingRequests,
    },
    {
      icon: "📋",
      title: "Records",
      subtitle: "View all borrow history",
      screen: "Records",
      color: "#22c55e",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSub}>IDEALab Management</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalComponents}</Text>
            <Text style={styles.statLabel}>Components</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#22c55e" }]}>{stats.activeBorrows}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#3b82f6" }]}>{stats.totalReturned}</Text>
            <Text style={styles.statLabel}>Returned</Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionTitle}>Management</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            {item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#64748b", fontSize: 12 },
  logoutBtn: { backgroundColor: "#1e293b", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: "#ef4444", fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: { color: "#f1f5f9", fontSize: 28, fontWeight: "800" },
  statLabel: { color: "#64748b", fontSize: 12, marginTop: 4 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  menuCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuIconText: { fontSize: 24 },
  menuInfo: { flex: 1 },
  menuTitle: { color: "#f1f5f9", fontSize: 16, fontWeight: "700" },
  menuSubtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  arrow: { color: "#334155", fontSize: 24 },
});