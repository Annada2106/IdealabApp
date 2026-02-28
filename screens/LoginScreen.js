import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Which role card was tapped on RoleSelectScreen
  const selectedRole = route?.params?.role || "student";
  const isAdminLogin = selectedRole === "admin";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const role = (data.role || "").trim().toLowerCase();

        if (isAdminLogin) {
          // Came from Admin card — must be admin
          if (role === "admin") {
            navigation.replace("AdminDashboard");
          } else {
            // Not an admin — sign them back out and warn
            await auth.signOut();
            Alert.alert(
              "Access Denied",
              "Sorry, you are not an admin. Please use the Student login instead.",
              [{ text: "OK" }]
            );
          }
        } else {
          // Came from Student card
          if (role === "admin") {
            // Admin trying to use student login — redirect them properly
            navigation.replace("AdminDashboard");
          } else {
            navigation.replace("UserDashboard");
          }
        }
      } else {
        await auth.signOut();
        Alert.alert("Account Not Found", "No account record found. Please register first.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: isAdminLogin ? "#f59e0b" : "#3b82f6" }]}>
            <Text style={styles.logoText}>{isAdminLogin ? "🛡️" : "🎓"}</Text>
          </View>
          <Text style={styles.title}>{isAdminLogin ? "Admin Login" : "Student Login"}</Text>
          <Text style={styles.subtitle}>
            {isAdminLogin ? "IDEALab Management Portal" : "IDEALab Component Borrowing"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: isAdminLogin ? "#f59e0b" : "#3b82f6" }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>
                {isAdminLogin ? "Login as Admin" : "Login as Student"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Register link — only for students */}
          {!isAdminLogin && (
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerLinkText}>
                Don't have an account?{" "}
                <Text style={styles.registerLinkBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>← Back to role selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  header: { alignItems: "center", marginBottom: 40 },
  logoBox: {
    width: 70, height: 70, borderRadius: 20,
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  logoText: { fontSize: 32 },
  title: { color: "#f1f5f9", fontSize: 26, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  form: { backgroundColor: "#1e293b", borderRadius: 20, padding: 24 },
  label: { color: "#94a3b8", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#0f172a", borderRadius: 12, padding: 14,
    color: "#f1f5f9", fontSize: 15, borderWidth: 1, borderColor: "#334155",
  },
  loginBtn: {
    borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerLink: { alignItems: "center", marginTop: 16 },
  registerLinkText: { color: "#64748b", fontSize: 14 },
  registerLinkBold: { color: "#3b82f6", fontWeight: "700" },
  backLink: { alignItems: "center", marginTop: 12 },
  backLinkText: { color: "#475569", fontSize: 13 },
});