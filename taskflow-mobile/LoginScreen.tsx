import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import API from "./api";
import { saveToken } from "./storage";
import axios from "axios";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setLoading(true);
  try {
    // 1. Get token
    const res = await API.post("auth/jwt/create/", { email, password });
    const token = res.data.access;
    console.log("✅ Token received:", token);
    console.log("🔑 Auth header:", `JWT ${token}`);

    // 2. Use API instance with explicit header
    const userRes = await API.get("auth/users/me/", {
      headers: { Authorization: `JWT ${token}` },  // ✅ explicit, no interceptor needed
    });
    console.log("✅ User data:", JSON.stringify(userRes.data));
    console.log("🔑 Sending header:", `JWT ${token}`);

    // 3. Remove role check for now — just let any user in
    await saveToken(token);
    onLogin();

  } catch (error: any) {
    console.log("❌ Error:", JSON.stringify(error?.response?.data || error?.message));
    Alert.alert("Login failed", error?.response?.data?.detail || "Check your credentials.");
    console.log("❌ Status:", error?.response?.status);
    console.log("❌ Headers sent:", JSON.stringify(error?.config?.headers));
    console.log("❌ URL called:", error?.config?.url);
    console.log("❌ Base URL:", error?.config?.baseURL);

  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskFlow</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", color: "#6366f1", marginBottom: 32, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 14, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: "#6366f1", borderRadius: 10,
    padding: 16, alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
