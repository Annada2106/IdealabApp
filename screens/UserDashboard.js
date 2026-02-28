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
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";

export default function UserDashboard({ navigation }) {
  const [components, setComponents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [purpose, setPurpose] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [activeTab, setActiveTab] = useState("components");
  const user = auth.currentUser;

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
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMyRequests(list);
    } catch (e) {
      console.log(e);
    }
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
    if (status === "Approved" || status === "Borrowed") return "#22c55e";
    if (status === "Pending") return "#f59e0b";
    if (status === "Returned") return "#3b82f6";
    if (status === "Rejected") return "#ef4444";
    return "#64748b";
  };

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

  const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.componentName}>{item.componentName}</Text>
        <Text style={styles.componentSub}>Qty: {item.quantity} • {item.purpose}</Text>
        <Text style={styles.componentSub}>
          Return by: {item.expectedReturn}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "22" }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

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
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => { setActiveTab("requests"); fetchMyRequests(); }}
        >
          <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
      ) : activeTab === "components" ? (
        <FlatList
          data={components}
          keyExtractor={(item) => item.id}
          renderItem={renderComponent}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No components available yet.</Text>
          }
        />
      ) : (
        <FlatList
          data={myRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No requests yet.</Text>
          }
        />
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
              placeholder="e.g. 2024-03-20"
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
  tabs: { flexDirection: "row", margin: 16, backgroundColor: "#1e293b", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#3b82f6" },
  tabText: { color: "#64748b", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardInfo: { flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  componentName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  componentSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  requestBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disabledBtn: { backgroundColor: "#334155" },
  requestBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#1e293b", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { color: "#f1f5f9", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalSubtitle: { color: "#3b82f6", fontSize: 15, marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 14,
    color: "#f1f5f9",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: "#0f172a", padding: 14, borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontWeight: "700" },
  submitBtn: { flex: 1, backgroundColor: "#3b82f6", padding: 14, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700" },
});