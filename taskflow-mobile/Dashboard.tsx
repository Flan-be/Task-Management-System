import React, { useEffect, useState, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, FlatList, RefreshControl, Modal, Pressable
} from "react-native";
import API from "./api";
import { deleteToken } from "./storage";
import ReportScreen from "./ReportScreen";

type Task = {
  id: number;
  task_name: string;
  task_description: string;
  task_due: string;
  task_priority: number;
  task_overdue: boolean;
  task_completed: boolean;
  project_name: string;
};

type SortKey = "due_asc" | "due_desc" | "priority_high" | "priority_low" | "name_asc" | "status";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "due_asc",       label: "Due Date (Earliest First)" },
  { key: "due_desc",      label: "Due Date (Latest First)" },
  { key: "priority_high", label: "Priority (High → Low)" },
  { key: "priority_low",  label: "Priority (Low → High)" },
  { key: "name_asc",      label: "Name (A → Z)" },
  { key: "status",        label: "Status (Pending First)" },
];

export default function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const [name, setName]           = useState("");
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey]     = useState<SortKey>("due_asc");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [reportTask, setReportTask] = useState<{ id: number; name: string } | null>(null);

  const fetchData = async () => {
    try {
      const [userRes, taskRes] = await Promise.all([
        API.get("auth/users/me/"),
        API.get("assignments/"),
      ]);
      setName(userRes.data.name || userRes.data.email);
      setTasks(taskRes.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (id: number) => {
    try {
      await API.patch(`assignments/${id}/complete/`);
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, task_completed: true } : t)
      );
    } catch {
      console.log("Failed to mark complete");
    }
  };

  const handleLogout = async () => {
    await deleteToken();
    onLogout();
  };

  const priorityLabel = (p: number) => {
    if (p >= 4) return { label: "High", color: "#ef4444" };
    if (p === 3) return { label: "Med",  color: "#f59e0b" };
    return              { label: "Low",  color: "#22c55e" };
  };

  const sortedTasks = useMemo(() => {
    const copy = [...tasks];
    switch (sortKey) {
      case "due_asc":
        return copy.sort((a, b) => {
          if (!a.task_due) return 1;
          if (!b.task_due) return -1;
          return new Date(a.task_due).getTime() - new Date(b.task_due).getTime();
        });
      case "due_desc":
        return copy.sort((a, b) => {
          if (!a.task_due) return 1;
          if (!b.task_due) return -1;
          return new Date(b.task_due).getTime() - new Date(a.task_due).getTime();
        });
      case "priority_high":
        return copy.sort((a, b) => b.task_priority - a.task_priority);
      case "priority_low":
        return copy.sort((a, b) => a.task_priority - b.task_priority);
      case "name_asc":
        return copy.sort((a, b) => a.task_name.localeCompare(b.task_name));
      case "status":
        return copy.sort((a, b) => Number(a.task_completed) - Number(b.task_completed));
      default:
        return copy;
    }
  }, [tasks, sortKey]);

  const pendingCount   = tasks.filter(t => !t.task_completed).length;
  const completedCount = tasks.filter(t => t.task_completed).length;
  const overdueCount   = tasks.filter(t => t.task_overdue && !t.task_completed).length;

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? "";

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#6366f1" />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {name} 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#6366f1" }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#22c55e" }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#ef4444" }]}>{overdueCount}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortBarLabel}>Sort:</Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortBtnText}>{currentSortLabel}</Text>
          <Text style={styles.sortChevron}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Task list — all tasks, completed shown dimmed at bottom */}
      <FlatList
        data={sortedTasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks assigned yet.</Text>
        }
        renderItem={({ item }) => {
          const { label, color } = priorityLabel(item.task_priority);
          return (
            <View style={[styles.card, item.task_completed && styles.cardDone]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{label}</Text>
                </View>
                {item.task_overdue && !item.task_completed && (
                  <Text style={styles.overdue}>OVERDUE</Text>
                )}
                {item.task_completed && (
                  <Text style={styles.completedTag}>COMPLETED</Text>
                )}
              </View>

              <Text style={styles.taskName}>{item.task_name}</Text>
              <Text style={styles.project}>📁 {item.project_name}</Text>

              {item.task_description ? (
                <Text style={styles.desc}>{item.task_description}</Text>
              ) : null}

              {item.task_due ? (
                <Text style={styles.due}>
                  Due: {new Date(item.task_due).toLocaleDateString()}
                </Text>
              ) : null}

              {!item.task_completed && (
                  <Text style={styles.incompleteLabel}>❌ Incomplete</Text>
              )}

              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => setReportTask({ id: item.id, name: item.task_name })}
                >
                  <Text style={styles.reportBtnText}>📋 Submit Report</Text>
                </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Sort Tasks By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalOption, sortKey === opt.key && styles.modalOptionActive]}
                onPress={() => { setSortKey(opt.key); setSortModalVisible(false); }}
              >
                <Text style={[styles.modalOptionText, sortKey === opt.key && styles.modalOptionTextActive]}>
                  {opt.label}
                </Text>
                {sortKey === opt.key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {reportTask && (
      <Modal visible animationType="slide">
        <ReportScreen
          taskId={reportTask.id}
          taskName={reportTask.name}
          onClose={() => setReportTask(null)}
          onSubmitted={() => {
            setReportTask(null);
            fetchData();
          }}
        />
      </Modal>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 20, paddingTop: 50,
    backgroundColor: "#6366f1",
  },
  greeting:   { fontSize: 18, fontWeight: "bold", color: "#fff" },
  logoutText: { color: "#fff", fontSize: 14 },

  // Stats
  statsRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
  },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12,
    alignItems: "center", marginHorizontal: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statNum:   { fontSize: 20, fontWeight: "bold", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  // Sort bar
  sortBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sortBarLabel: { fontSize: 13, color: "#6b7280", marginRight: 8 },
  sortBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 6, borderWidth: 1, borderColor: "#e5e7eb",
  },
  sortBtnText:  { fontSize: 13, color: "#374151", fontWeight: "500" },
  sortChevron:  { fontSize: 12, color: "#6b7280", marginLeft: 6 },

  // Task cards
  empty: { textAlign: "center", marginTop: 60, color: "#9ca3af", fontSize: 16 },
  card: {
    backgroundColor: "#fff", marginHorizontal: 16,
    marginBottom: 12, borderRadius: 12, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  cardDone: { opacity: 0.55 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:     { color: "#fff", fontSize: 11, fontWeight: "bold" },
  overdue:       { color: "#ef4444", fontSize: 11, fontWeight: "bold" },
  completedTag:  { color: "#22c55e", fontSize: 11, fontWeight: "bold" },
  taskName:      { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  project:       { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  desc:          { fontSize: 13, color: "#4b5563", marginBottom: 6 },
  due:           { fontSize: 12, color: "#9ca3af", marginBottom: 10 },
  completeBtn: {
    backgroundColor: "#6366f1", borderRadius: 8,
    paddingVertical: 8, alignItems: "center",
  },
  completeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  completedLabel:  { color: "#22c55e", fontWeight: "bold", fontSize: 13, textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
  },
  modalTitle: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  modalOption: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  modalOptionActive:     { },
  modalOptionText:       { fontSize: 15, color: "#374151" },
  modalOptionTextActive: { color: "#6366f1", fontWeight: "600" },
  checkmark:             { fontSize: 16, color: "#6366f1" },

  reportBtn: {
  marginTop: 8, borderRadius: 8, paddingVertical: 8,
  alignItems: "center", borderWidth: 1, borderColor: "#6366f1",
 },
  reportBtnText: { color: "#6366f1", fontWeight: "600", fontSize: 13 },

  incompleteLabel:  { color: "#ec1818", fontWeight: "bold", fontSize: 13, textAlign: "center" },
});