import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator, SafeAreaView,
} from "react-native";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function InventoryScreen({ navigation }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [available, setAvailable] = useState("");

  useEffect(() => { fetchComponents(); }, []);

  const fetchComponents = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "components"));
    setComponents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setName(""); setTotal(""); setAvailable("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setName(item.name);
    setTotal(String(item.total));
    setAvailable(String(item.available));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !total || !available) {
      Alert.alert("Error", "Fill all fields");
      return;
    }
    try {
      if (editItem) {
        await updateDoc(doc(db, "components", editItem.id), {
          name, total: parseInt(total), available: parseInt(available),
        });
      } else {
        await addDoc(collection(db, "components"), {
          name, total: parseInt(total), available: parseInt(available),
        });
      }
      setModalVisible(false);
      fetchComponents();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (item) => {
    Alert.alert("Delete", `Delete ${item.name}?`, [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "components", item.id));
          fetchComponents();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🔧</Text>
        </View>
        <View>
          <Text style={styles.componentName}>{item.name}</Text>
          <Text style={styles.componentSub}>
            Available: <Text style={{ color: item.available > 0 ? "#22c55e" : "#ef4444" }}>{item.available}</Text>
            {" "}/ Total: {item.total}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={components}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No components. Add some!</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editItem ? "Edit Component" : "Add Component"}</Text>

            <Text style={styles.label}>Component Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="e.g. Arduino Uno" placeholderTextColor="#94a3b8" />

            <Text style={styles.label}>Total Quantity</Text>
            <TextInput style={styles.input} value={total} onChangeText={setTotal}
              keyboardType="number-pad" placeholderTextColor="#94a3b8" />

            <Text style={styles.label}>Available Quantity</Text>
            <TextInput style={styles.input} value={available} onChangeText={setAvailable}
              keyboardType="number-pad" placeholderTextColor="#94a3b8" />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                <Text style={styles.submitBtnText}>Save</Text>
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
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#1e293b",
  },
  backText: { color: "#3b82f6", fontSize: 16 },
  headerTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "800" },
  addBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#1e293b", borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: { width: 44, height: 44, backgroundColor: "#0f172a", borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  iconText: { fontSize: 20 },
  componentName: { color: "#f1f5f9", fontSize: 15, fontWeight: "700" },
  componentSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: { backgroundColor: "#3b82f622", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: "#3b82f6", fontWeight: "700", fontSize: 13 },
  deleteBtn: { backgroundColor: "#ef444422", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 13 },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#1e293b", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { color: "#f1f5f9", fontSize: 20, fontWeight: "800", marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#0f172a", borderRadius: 12, padding: 14, color: "#f1f5f9", fontSize: 15, borderWidth: 1, borderColor: "#334155" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: "#0f172a", padding: 14, borderRadius: 12, alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontWeight: "700" },
  submitBtn: { flex: 1, backgroundColor: "#3b82f6", padding: 14, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700" },
});