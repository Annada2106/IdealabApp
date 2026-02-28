import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";

export default function UserDashboard({ navigation }) {
  const [components, setComponents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [purpose, setPurpose] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [activeTab, setActiveTab] = useState("components");
  const [historyFilter, setHistoryFilter] = useState("All");
  const user = auth.currentUser;

  const historyFilters = ["All", "Pending", "Borrowed", "Returned", "Rejected"];

  useEffect(() => {
    fetchComponents();
    fetchMyRequests();
  }, []);

  const fetchComponents = async () => {
    try {
      const snap = await getDocs(collection(db, "components"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComponents(list);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const fetchMyRequests = async () => {
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by most recent first
      list.sort((a, b) => {
        const dateA = a.borrowDate?.toDate ? a.borrowDate.toDate() : new Date(0);
        const dateB = b.borrowDate?.toDate ? b.borrowDate.toDate() : new Date(0);
        return dateB - dateA;
      });
      setMyRequests(list);
    } catch (e) {
      console.log(e);
    }
    setHistoryLoading(false);
  };

  const openRequestModal = (component) => {
    setSelectedComponent(component);
    setQuantity("1");
    setPurpose("");
    setReturnDate("");
    setModalVisible(true);
  };

  const submitRequest = async () => {
    if (!purpose || !returnDate) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        userName: user.email,
        componentId: selectedComponent.id,
        componentName: selectedComponent.name,
        quantity: parseInt(quantity),
        purpose: purpose,
        borrowDate: new Date(),
        expectedReturn: returnDate,
        actualReturn: null,
        status: "Pending",
      });
      Alert.alert("Success", "Request submitted! Waiting for admin approval.");
      setModalVisible(false);
      fetchMyRequests();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const getStatusColor = (status) => {
    if (status === "Borrowed") return "#22c55e";
    if (status === "Pending") return "#f59e0b";
    if (status === "Returned") return "#3b82f6";
    if (status === "Rejected") return "#ef4444";
    return "#64748b";
  };

  const getStatusIcon = (status) => {
    if (status === "Borrowed") return "✓";
    if (status === "Pending") return "⏳";
    if (status === "Returned") return "↩";
    if (status === "Rejected") return "✕";
    return "•";
  };

  const filteredRequests =
    historyFilter === "All"
      ? myRequests
      : myRequests.filter((r) => r.status === historyFilter);

  // Summary counts for history tab
  const pendingCount = myRequests.filter((r) => r.status === "Pending").length;
  const borrowedCount = myRequests.filter((r) => r.status === "Borrowed").length;
  const returnedCount = myRequests.filter((r) => r.status === "Returned").length;
  const rejectedCount = myRequests.filter((r) => r.status === "Rejected").length;

  const renderComponent = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🔧</Text>
        </View>
        <View>
          <Text style={styles.componentName}>{item.name}</Text>
          <Text style={styles.componentSub}>
            Available:{" "}
            <Text style={{ color: item.available > 0 ? "#22c55e" : "#ef4444" }}>
              {item.available}
            </Text>{" "}
            / Total: {item.total}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.requestBtn, item.available === 0 && styles.disabledBtn]}
        onPress={() => openRequestModal(item)}
        disabled={item.available === 0}
      >
        <Text style={styles.requestBtnText}>
          {item.available === 0 ? "Out" : "Request"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistoryItem = ({ item }) => {
    const borrowDate = item.borrowDate?.toDate
      ? item.borrowDate.toDate().toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "N/A";

    const returnedDate = item.actualReturn?.toDate
      ? item.actualReturn.toDate().toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })
      : null;

    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.historyCard}>
        {/* Top row — component name + status badge */}
        <View style={styles.historyTop}>
          <View style={styles.historyIconBox}>
            <Text style={styles.historyIconText}>🔧</Text>
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyComponentName}>{item.componentName}</Text>
            <Text style={styles.historyQty}>Qty: {item.quantity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        {/* Details row */}
        <View style={styles.historyDetails}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Requested</Text>
            <Text style={styles.detailValue}>{borrowDate}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Return By</Text>
            <Text style={styles.detailValue}>{item.expectedReturn || "—"}</Text>
          </View>

          {returnedDate && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Returned On</Text>
                <Text style={[styles.detailValue, { color: "#3b82f6" }]}>{returnedDate}</Text>
              </View>
            </>
          )}
        </View>

        {/* Purpose */}
        {item.purpose ? (
          <View style={styles.purposeRow}>
            <Text style={styles.purposeLabel}>Purpose: </Text>
            <Text style={styles.purposeValue}>{item.purpose}</Text>
          </View>
        ) : null}

        {/* Rejection note */}
        {item.status === "Rejected" && (
          <View style={styles.rejectedNote}>
            <Text style={styles.rejectedNoteText}>
              ✕ This request was rejected by the admin.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>IDEALab</Text>
          <Text style={styles.headerSub}>Student Portal</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "components" && styles.activeTab]}
          onPress={() => setActiveTab("components")}
        >
          <Text style={[styles.tabText, activeTab === "components" && styles.activeTabText]}>
            Components
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => { setActiveTab("history"); fetchMyRequests(); }}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            My History
          </Text>
          {pendingCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Components Tab */}
      {activeTab === "components" && (
        <>
          {loading ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={components}
              keyExtractor={(item) => item.id}
              renderItem={renderComponent}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No components available yet.</Text>
              }
            />
          )}
        </>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <>
          {/* Summary stats */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={[styles.statNum, { color: "#f59e0b" }]}>{pendingCount}</Text>
              <Text style={styles.statLbl}>Pending</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={[styles.statNum, { color: "#22c55e" }]}>{borrowedCount}</Text>
              <Text style={styles.statLbl}>Borrowed</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={[styles.statNum, { color: "#3b82f6" }]}>{returnedCount}</Text>
              <Text style={styles.statLbl}>Returned</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={[styles.statNum, { color: "#ef4444" }]}>{rejectedCount}</Text>
              <Text style={styles.statLbl}>Rejected</Text>
            </View>
          </View>

          {/* Filter chips */}
          <FlatList
            data={historyFilters}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, historyFilter === item && styles.activeChip]}
                onPress={() => setHistoryFilter(item)}
              >
                <Text style={[styles.filterText, historyFilter === item && styles.activeFilterText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* History list */}
          {historyLoading ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>
                    {historyFilter === "All"
                      ? "No requests yet. Browse components and make your first request!"
                      : `No ${historyFilter} requests.`}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Request Component</Text>
            <Text style={styles.modalSubtitle}>{selectedComponent?.name}</Text>

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.input}
              placeholder="What is this for?"
              placeholderTextColor="#94a3b8"
              value={purpose}
              onChangeText={setPurpose}
            />

            <Text style={styles.label}>Expected Return Date</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 20 Mar 2026"
              placeholderTextColor="#94a3b8"
              value={returnDate}
              onChangeText={setReturnDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#1e293b",
  },
  headerTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#64748b", fontSize: 12 },
  logoutBtn: { backgroundColor: "#1e293b", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: "#ef4444", fontWeight: "600" },
  tabs: {
    flexDirection: "row", margin: 16,
    backgroundColor: "#1e293b", borderRadius: 12, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: "center",
    borderRadius: 10, flexDirection: "row", justifyContent: "center", gap: 6,
  },
  activeTab: { backgroundColor: "#3b82f6" },
  tabText: { color: "#64748b", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  tabBadge: {
    backgroundColor: "#ef4444", borderRadius: 8,
    minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
  },
  tabBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  // Stats row
  statsRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingBottom: 8, gap: 8,
  },
  statPill: {
    flex: 1, backgroundColor: "#1e293b", borderRadius: 12,
    padding: 10, alignItems: "center",
  },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLbl: { color: "#64748b", fontSize: 10, marginTop: 2 },

  // Filter chips
  filterList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: "#1e293b",
  },
  activeChip: { backgroundColor: "#3b82f6" },
  filterText: { color: "#64748b", fontWeight: "600", fontSize: 13 },
  activeFilterText: { color: "#fff" },

  list: { paddingHorizontal: 16, paddingBottom: 20 },

  // Component card
  card: {
    backgroundColor: "#1e293b", borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 44, height: 44, backgroundColor: "#0f172a",
    borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  iconText: { fontSize: 20 },
  componentName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  componentSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  requestBtn: {
    backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  disabledBtn: { backgroundColor: "#334155" },
  requestBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // History card
  historyCard: {
    backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 12,
  },
  historyTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  historyIconBox: {
    width: 40, height: 40, backgroundColor: "#0f172a",
    borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  historyIconText: { fontSize: 18 },
  historyInfo: { flex: 1 },
  historyComponentName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  historyQty: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  statusIcon: { fontSize: 11, fontWeight: "800" },
  statusText: { fontSize: 12, fontWeight: "700" },

  historyDetails: {
    flexDirection: "row", backgroundColor: "#0f172a",
    borderRadius: 12, padding: 12, marginBottom: 8, alignItems: "center",
  },
  detailBox: { flex: 1, alignItems: "center" },
  detailLabel: { color: "#64748b", fontSize: 10, marginBottom: 3 },
  detailValue: { color: "#f1f5f9", fontSize: 12, fontWeight: "600", textAlign: "center" },
  detailDivider: { width: 1, height: 28, backgroundColor: "#334155", marginHorizontal: 8 },

  purposeRow: { flexDirection: "row", marginTop: 4 },
  purposeLabel: { color: "#64748b", fontSize: 12 },
  purposeValue: { color: "#94a3b8", fontSize: 12, flex: 1 },

  rejectedNote: {
    marginTop: 10, backgroundColor: "#ef444411",
    borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: "#ef4444",
  },
  rejectedNoteText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },

  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#64748b", textAlign: "center", fontSize: 14, paddingHorizontal: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end" },
  modalBox: {
    backgroundColor: "#1e293b", borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
  },
  modalTitle: { color: "#f1f5f9", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalSubtitle: { color: "#3b82f6", fontSize: 15, marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#0f172a", borderRadius: 12, padding: 14,
    color: "#f1f5f9", fontSize: 15, borderWidth: 1, borderColor: "#334155",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: "#0f172a", padding: 14, borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontWeight: "700" },
  submitBtn: { flex: 1, backgroundColor: "#3b82f6", padding: 14, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700" },
});