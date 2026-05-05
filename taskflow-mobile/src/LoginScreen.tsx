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

    // 2. Check role before saving token
    const userRes = await axios.get("http://10.0.2.2:8000/api/auth/users/me/", {
      headers: { Authorization: `JWT ${token}` },
    });

    if (userRes.data.role !== "member") {
      Alert.alert(
        "Access Denied",
        "This app is only available for members."
      );
      return; // don't save the token, don't navigate
    }

    // 3. Only save and proceed if role is member
    await saveToken(token);
    onLogin();
  } catch {
    Alert.alert("Login failed", "Check your credentials.");
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