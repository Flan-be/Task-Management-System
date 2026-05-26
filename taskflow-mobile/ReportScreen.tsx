import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView, Alert
} from "react-native";
import API from "./api";

type Status = "complete" | "incomplete" | "blocked";

const STATUS_OPTIONS: { key: Status; label: string; color: string }[] = [
  { key: "complete",   label: "Complete",   color: "#22c55e" },
  { key: "incomplete", label: "Incomplete", color: "#f59e0b" },
  { key: "blocked",    label: "Blocked",    color: "#ef4444" },
];

interface Report {
  id: number;
  status: Status;
  comment: string;
  feedback: string;
  reviewed_by_name: string;
  reviewed_at: string;
  created_at: string;
}

interface Props {
  taskId: number;
  taskName: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReportScreen({ taskId, taskName, onClose, onSubmitted }: Props) {
  const [status, setStatus] = useState<Status | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [existingReport, setExistingReport] = useState<Report | null>(null);



  // Fetch existing reports for this task
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get(`reports/?task=${taskId}`);
        if (res.data.length > 0) {
        setExistingReport(res.data[res.data.length - 1]);
      }
    } catch {}
    finally { setLoadingReports(false); }
  };
    fetchReports();
  }, [taskId]);

  const handleSubmit = async () => {
  if (!status) {
    Alert.alert("Select a status", "Please select Complete, Incomplete, or Blocked.");
    return;
  }
  setSubmitting(true);
  try {
    if (existingReport) {
      // update existing report
      await API.patch(`reports/${existingReport.id}/`, { status, comment });
    } else {
      // create new
      await API.post("reports/", { task: taskId, status, comment });
    }

    // if complete, mark task done
    if (status === "complete") {
      await API.patch(`assignments/${taskId}/complete/`);
    }

    Alert.alert("Report Submitted", "Your report has been sent to the manager.");
    onSubmitted();
  } catch {
    Alert.alert("Error", "Failed to submit report. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const statusColor = (s: string) => {
    if (s === "complete")   return "#22c55e";
    if (s === "incomplete") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Report</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        {/* Task name */}
        <View style={styles.taskBox}>
          <Text style={styles.taskLabel}>TASK</Text>
          <Text style={styles.taskName}>{taskName}</Text>
        </View>

        {/* Previous reports + feedback */}
    {loadingReports ? (
        <ActivityIndicator color="#6366f1" style={{ marginVertical: 16 }} />
    ) : existingReport ? (
    <View style={styles.historySection}>
        <Text style={styles.sectionLabel}>Report Thread</Text>
        <View style={styles.threadCard}>
        {/* Status pill */}
        <View style={styles.threadHeader}>
            <View style={[styles.statusPill, { backgroundColor: statusColor(existingReport.status) }]}>
            <Text style={styles.statusPillText}>
                {existingReport.status.charAt(0).toUpperCase() + existingReport.status.slice(1)}
            </Text>
            </View>
            <Text style={styles.reportDate}>
            {new Date(existingReport.created_at).toLocaleDateString()}
            </Text>
        </View>

        {/* Messages */}
        {existingReport.messages?.map((msg: any) => (
            <View
            key={msg.id}
            style={[
                styles.bubble,
                msg.sender_role === 'manager' ? styles.bubbleManager : styles.bubbleMember
            ]}
            >
            <Text style={[
                styles.bubbleSender,
                msg.sender_role === 'manager' ? { color: '#3b82f6' } : { color: '#6b7280' }
            ]}>
                {msg.sender_name}
            </Text>
            <Text style={styles.bubbleText}>{msg.message}</Text>
            <Text style={styles.bubbleTime}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            </View>
        ))}

        {existingReport.messages?.length === 0 && (
            <Text style={styles.pendingText}>⏳ Awaiting manager feedback</Text>
        )}
        </View>
        <Text style={styles.updateHint}>
        Submitting a new report will update the status and add to the thread.
        </Text>
    </View>
    ) : null}

        {/* New report form */}
        <Text style={styles.sectionLabel}>New Report</Text>

        {/* Status picker */}
        <Text style={styles.fieldLabel}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.statusBtn,
                status === opt.key && { backgroundColor: opt.color, borderColor: opt.color }
              ]}
              onPress={() => setStatus(opt.key)}
            >
              <Text style={[
                styles.statusBtnText,
                status === opt.key && { color: "#fff" }
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Complete notice */}
        {status === "complete" && (
          <View style={styles.completeNotice}>
            <Text style={styles.completeNoticeText}>
              ✓ Submitting as Complete will also mark this task as done.
            </Text>
          </View>
        )}

        {/* Comment */}
        <Text style={styles.fieldLabel}>Comment</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe what was done, any issues, or reasons for the status..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!status || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!status || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Report</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6366f1",
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn:     { width: 60 },
  backText:    { color: "#fff", fontSize: 14 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  body:        { padding: 16 },

  taskBox: {
    backgroundColor: "#fff", borderRadius: 10, padding: 14,
    marginBottom: 20, borderLeftWidth: 4, borderLeftColor: "#6366f1",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  taskLabel: { fontSize: 11, color: "#6b7280", fontWeight: "600", marginBottom: 4 },
  taskName:  { fontSize: 16, fontWeight: "bold", color: "#111827" },

  historySection: { marginBottom: 24 },

  reportCard: {
    backgroundColor: "#fff", borderRadius: 10, padding: 14,
    marginBottom: 12, borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reportCardHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },
  statusPill: {
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3,
  },
  statusPillText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  reportDate:     { fontSize: 12, color: "#9ca3af" },

  commentBox: {
    backgroundColor: "#f9fafb", borderRadius: 8,
    padding: 10, marginBottom: 8,
  },
  commentLabel: { fontSize: 10, color: "#6b7280", fontWeight: "600", marginBottom: 4 },
  commentText:  { fontSize: 13, color: "#374151" },

  feedbackBox: {
    backgroundColor: "#eff6ff", borderRadius: 8, padding: 10,
  },
  feedbackLabel: { fontSize: 10, color: "#3b82f6", fontWeight: "600", marginBottom: 4 },
  feedbackText:  { fontSize: 13, color: "#1e3a5f" },

  pendingBox: {
    backgroundColor: "#fefce8", borderRadius: 8, padding: 10,
  },
  pendingText: { fontSize: 12, color: "#92400e" },

  sectionLabel: {
    fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8,
  },
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statusBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1.5, borderColor: "#e5e7eb",
    alignItems: "center", backgroundColor: "#fff",
  },
  statusBtnText: { fontSize: 12, fontWeight: "600", color: "#374151" },

  completeNotice: {
    backgroundColor: "#f0fdf4", borderRadius: 8,
    padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#bbf7d0",
  },
  completeNoticeText: { fontSize: 12, color: "#15803d" },

  textArea: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1,
    borderColor: "#e5e7eb", padding: 12, fontSize: 14,
    color: "#111827", minHeight: 120, marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: "#6366f1", borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  updateHint: {fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: -4, marginBottom: 16,},

  threadCard: {
  backgroundColor: "#fff", borderRadius: 12, padding: 14,
  marginBottom: 8,
  shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
},
threadHeader: {
  flexDirection: "row", justifyContent: "space-between",
  alignItems: "center", marginBottom: 12,
},
bubble: {
  maxWidth: "80%", borderRadius: 12, padding: 10, marginBottom: 8,
},
bubbleMember: {
  backgroundColor: "#f3f4f6", alignSelf: "flex-start",
  borderBottomLeftRadius: 4,
},
bubbleManager: {
  backgroundColor: "#eff6ff", alignSelf: "flex-end",
  borderBottomRightRadius: 4,
},
bubbleSender: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
bubbleText:   { fontSize: 13, color: "#111827" },
bubbleTime:   { fontSize: 10, color: "#9ca3af", marginTop: 4, textAlign: "right" },
});