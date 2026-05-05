import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import API from "./api";
import { getToken, deleteToken } from "./storage";

export default function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      try {
        const res = await API.get("auth/users/me/", {
          headers: { Authorization: `JWT ${token}` },
        });
        setName(res.data.name || res.data.email);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await deleteToken();
    onLogout();
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6366f1" />;

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {name} 👋</Text>
      <Text style={styles.sub}>Your TaskFlow dashboard</Text>
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#6366f1", marginBottom: 8 },
  sub: { fontSize: 16, color: "#6b7280", marginBottom: 40 },
  logout: {
    backgroundColor: "#ec4899", borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 32,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

