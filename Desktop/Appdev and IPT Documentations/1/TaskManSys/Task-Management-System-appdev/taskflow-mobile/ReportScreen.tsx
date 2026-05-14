import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from "react-native";
import API from "./api";

type Task = {
  id: number;
  task_name: string;
  task_description: string;
  task_due: string;
  task_priority: number;
  task_overdue: boolean;
  task_completed: boolean;
  project_name: string;
  is_completed: boolean;
  comment: string;
  report_status: "none" | "complete" | "incomplete";
};

type Props = {
  task: Task;
  assignmentId: number;
  onBack: () => void;
  onUpdate: (updated: Partial<Task>) => void;
};

export default function ReportScreen({ task, assignmentId, onBack, onUpdate }: Props) {
  const [isCompleted, setIsCompleted]     = useState(task.is_completed);
  const [reportStatus, setReportStatus]   = useState(task.report_status);
  const [comment, setComment]             = useState(task.comment || "");
  const [saving, setSaving]               = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.patch(`assignments/${assignmentId}/report/`, {
        is_completed: isCompleted,
        report_status: reportStatus,
        comment,
      });
      onUpdate({ is_completed: isCompleted, report_status: reportStatus, comment });
      Alert.alert("Saved", "Your report has been submitted.");
      onBack();
    } catch {
      Alert.alert("Error", "Failed to save report. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const priorityLabel = (p: number) => {
    if (p >= 4) return { label: "High", color: "#ef4444" };
    if (p === 3) return { label: "Med",  color: "#f59e0b" };
    return              { label: "Low",  color: "#22c55e" };
  };

  const { label, color } = priorityLabel(task.task_priority);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Report</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Task Info */}
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{label}</Text>
          </View>
          {task.task_overdue && !isCompleted && (
            <Text style={styles.overdueTag}>OVERDUE</Text>
          )}
        </View>
        <Text style={styles.taskName}>{task.task_name}</Text>
        <Text style={styles.project}>📁 {task.project_name}</Text>
        {task.task_description ? (
          <Text style={styles.desc}>{task.task_description}</Text>
        ) : null}
        {task.task_due ? (
          <Text style={styles.due}>
            Due: {new Date(task.task_due).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      {/* Completion Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completion Status</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isCompleted && styles.toggleActive]}
            onPress={() => {
              setIsCompleted(true);
              setReportStatus("complete");
            }}
          >
            <Text style={[styles.toggleText, isCompleted && styles.toggleTextActive]}>
              ✓ Mark Complete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isCompleted && styles.toggleInactive]}
            onPress={() => {
              setIsCompleted(false);
              setReportStatus("incomplete");
            }}
          >
            <Text style={[styles.toggleText, !isCompleted && styles.toggleTextInactive]}>
              ✗ Not Complete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Report Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Status</Text>
        <View style={styles.statusRow}>
          {(["none", "complete", "incomplete"] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, reportStatus === s && styles.statusBtnActive(s)]}
              onPress={() => setReportStatus(s)}
            >
              <Text style={[styles.statusText, reportStatus === s && styles.statusTextActive]}>
                {s === "none" ? "None" : s === "complete" ? "✓ Complete" : "✗ Incomplete"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {reportStatus === "incomplete" ? "Reason for Incomplete *" : "Comment (optional)"}
        </Text>
        <TextInput
          style={styles.commentInput}
          multiline
          numberOfLines={5}
          placeholder={
            reportStatus === "incomplete"
              ? "Explain why the task is incomplete..."
              : "Add any notes or updates..."
          }
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.saveBtnText}>Submit Report</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#6366f1", paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn:     { width: 60 },
  backText:    { color: "#fff", fontSize: 14 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  card: {
    backgroundColor: "#fff", margin: 16, borderRadius: 12,
    padding: 16, elevation: 2,
  },
  badgeRow:   { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:  { color: "#fff", fontSize: 11, fontWeight: "bold" },
  overdueTag: { color: "#ef4444", fontSize: 11, fontWeight: "bold" },
  taskName:   { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 4 },
  project:    { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  desc:       { fontSize: 13, color: "#4b5563", marginBottom: 6 },
  due:        { fontSize: 12, color: "#9ca3af" },

  section:      { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 },

  toggleRow:        { flexDirection: "row", gap: 10 },
  toggleBtn:        { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", backgroundColor: "#fff" },
  toggleActive:     { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  toggleInactive:   { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
  toggleText:       { fontWeight: "600", color: "#6b7280" },
  toggleTextActive: { color: "#fff" },
  toggleTextInactive:{ color: "#ef4444" },

  statusRow: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", backgroundColor: "#fff" },
  statusBtnActive: (s: string) => ({
    backgroundColor: s === "complete" ? "#dcfce7" : s === "incomplete" ? "#fee2e2" : "#f3f4f6",
    borderColor: s === "complete" ? "#22c55e" : s === "incomplete" ? "#ef4444" : "#9ca3af",
  }),
  statusText:       { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  statusTextActive: { fontWeight: "700", color: "#111827" },

  commentInput: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
    borderRadius: 10, padding: 12, fontSize: 14, minHeight: 120,
  },

  saveBtn:     { margin: 16, backgroundColor: "#6366f1", borderRadius: 10, padding: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});