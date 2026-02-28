import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView,
} from "react-native";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function RequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const q = query(collection(db, "transactions"), where("status", "==", "Pending"));
    const snap = await getDocs(q);
    setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleApprove = async (request) => {
    try {
      // Update transaction status
      await updateDoc(doc(db, "transactions", request.id), {
        status: "Borrowed",
        approvedAt: new Date(),
      });

      // Decrease available count
      const compSnap = await getDocs(collection(db, "components"));
      const compDoc = compSnap.docs.find((d) => d.id === request.componentId);
      if (compDoc) {
        const currentAvailable = compDoc.data().available;
        await updateDoc(doc(db, "components", request.componentId), {
          available: Math.max(0, currentAvailable - request.quantity),
        });
      }

      Alert.alert("Approved", `${request.componentName} approved for ${request.userName}`);
      fetchRequests();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleReject = async (request) => {
    Alert.alert("Reject Request", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Reject", style: "destructive",
        onPress: async () => {
          await updateDoc(doc(db, "transactions", request.id), { status: "Rejected" });
          fetchRequests();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const borrowDate = item.borrowDate?.toDate
      ? item.borrowDate.toDate().toLocaleDateString()
      : "N/A";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {item.userName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.date}>Requested: {borrowDate}</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Component</Text>
            <Text style={styles.detailValue}>{item.componentName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purpose</Text>
            <Text style={styles.detailValue}>{item.purpose}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Return By</Text>
            <Text style={styles.detailValue}>{item.expectedReturn}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item)}>
            <Text style={styles.rejectBtnText}>✕ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
            <Text style={styles.approveBtnText}>✓ Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Requests</Text>
        <TouchableOpacity onPress={fetchRequests}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No pending requests!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#1e293b",
  },
  backText: { color: "#3b82f6", fontSize: 16 },
  headerTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "800" },
  refreshText: { color: "#3b82f6", fontSize: 16 },
  list: { padding: 16 },
  card: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarBox: {
    width: 42, height: 42, backgroundColor: "#3b82f6",
    borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cardInfo: { flex: 1 },
  userName: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  date: { color: "#64748b", fontSize: 12 },
  pendingBadge: { backgroundColor: "#f59e0b22", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pendingText: { color: "#f59e0b", fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#334155", marginBottom: 12 },
  details: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { color: "#64748b", fontSize: 13 },
  detailValue: { color: "#f1f5f9", fontSize: 13, fontWeight: "600" },
  buttons: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, backgroundColor: "#ef444422", padding: 12, borderRadius: 12, alignItems: "center" },
  rejectBtnText: { color: "#ef4444", fontWeight: "700" },
  approveBtn: { flex: 1, backgroundColor: "#22c55e22", padding: 12, borderRadius: 12, alignItems: "center" },
  approveBtnText: { color: "#22c55e", fontWeight: "700" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#64748b", fontSize: 16 },
});