import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "./storage";
import API from "./api";
import LoginScreen from "./LoginScreen";
import DashboardScreen from "./Dashboard";

type Screen = "login" | "dashboard";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
  (async () => {
    const token = await getToken();
    if (token) {
      try {
        await API.get("auth/users/me/", {
          headers: { Authorization: `JWT ${token}` },
        });
        setScreen("dashboard");
      } catch {
        setScreen("login");
      }
    }
    setChecking(false);
  })();
  
}, []);

  if (checking) return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return screen === "login"
    ? <LoginScreen onLogin={() => setScreen("dashboard")} />
    : <DashboardScreen onLogout={() => setScreen("login")} />;
}