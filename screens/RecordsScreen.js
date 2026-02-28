import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView,
} from "react-native";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function RecordsScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Borrowed", "Pending", "Returned", "Rejected"];

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "transactions"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort by most recent first
    list.sort((a, b) => {
      const dateA = a.borrowDate?.toDate ? a.borrowDate.toDate() : new Date(0);
      const dateB = b.borrowDate?.toDate ? b.borrowDate.toDate() : new Date(0);
      return dateB - dateA;
    });
    setRecords(list);
    setLoading(false);
  };

  const handleMarkReturned = async (record) => {
    Alert.alert("Mark as Returned", `Confirm return of ${record.componentName}?`, [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "transactions", record.id), {
              status: "Returned",
              actualReturn: new Date(),
            });
            // Increase available count
            const compSnap = await getDocs(collection(db, "components"));
            const compDoc = compSnap.docs.find((d) => d.id === record.componentId);
            if (compDoc) {
              await updateDoc(doc(db, "components", record.componentId), {
                available: compDoc.data().available + record.quantity,
              });
            }
            Alert.alert("Success", "Marked as returned!");
            fetchRecords();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    if (status === "Borrowed") return "#f59e0b";
    if (status === "Pending") return "#94a3b8";
    if (status === "Returned") return "#22c55e";
    if (status === "Rejected") return "#ef4444";
    return "#64748b";
  };

  const filteredRecords = filter === "All"
    ? records
    : records.filter((r) => r.status === filter);

  const renderItem = ({ item }) => {
    const borrowDate = item.borrowDate?.toDate
      ? item.borrowDate.toDate().toLocaleDateString()
      : "N/A";
    const returnDate = item.actualReturn?.toDate
      ? item.actualReturn.toDate().toLocaleDateString()
      : item.expectedReturn || "—";

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {item.userName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.componentName}>{item.componentName} × {item.quantity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "22" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Borrowed</Text>
            <Text style={styles.dateValue}>{borrowDate}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>
              {item.status === "Returned" ? "Returned" : "Expected"}
            </Text>
            <Text style={styles.dateValue}>{returnDate}</Text>
          </View>
        </View>

        {item.purpose && (
          <Text style={styles.purpose}>Purpose: {item.purpose}</Text>
        )}

        {item.status === "Borrowed" && (
          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => handleMarkReturned(item)}
          >
            <Text style={styles.returnBtnText}>Mark as Returned</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Records</Text>
        <TouchableOpacity onPress={fetchRecords}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <FlatList
        data={filters}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.activeChip]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
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
  refreshText: { color: "#3b82f6", fontSize: 20 },
  filterList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#1e293b",
  },
  activeChip: { backgroundColor: "#3b82f6" },
  filterText: { color: "#64748b", fontWeight: "600", fontSize: 13 },
  activeFilterText: { color: "#fff" },
  list: { padding: 16 },
  card: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarBox: {
    width: 40, height: 40, backgroundColor: "#3b82f6",
    borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  cardInfo: { flex: 1 },
  userName: { color: "#94a3b8", fontSize: 12 },
  componentName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  dateRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0f172a", borderRadius: 12, padding: 12, marginBottom: 8,
  },
  dateBox: { flex: 1, alignItems: "center" },
  dateLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  dateValue: { color: "#f1f5f9", fontSize: 13, fontWeight: "600" },
  arrow: { color: "#334155", fontSize: 18, marginHorizontal: 8 },
  purpose: { color: "#64748b", fontSize: 12, marginBottom: 10 },
  returnBtn: {
    backgroundColor: "#22c55e22", padding: 12,
    borderRadius: 12, alignItems: "center", marginTop: 4,
  },
  returnBtnText: { color: "#22c55e", fontWeight: "700" },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40 },
});