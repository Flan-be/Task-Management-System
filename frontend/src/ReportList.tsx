import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip,
  TextField, Button, Divider, Avatar
} from '@mui/material';
import API from './API.tsx';

interface Message {
  id: number;
  sender_name: string;
  sender_role: 'member' | 'manager';
  message: string;
  created_at: string;
}

interface Report {
  id: number;
  task: number;
  task_name: string;
  submitted_by_name: string;
  status: string;
  messages: Message[];
  created_at: string;
}

interface Props {
  projectId: number;
  tasks: { id: number }[];
}

const statusColor: Record<string, 'success' | 'warning' | 'error'> = {
  complete: 'success',
  incomplete: 'warning',
  blocked: 'error',
};

export default function ReportList({ projectId, tasks }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [reply, setReply] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const taskIds = tasks.map(t => t.id);

  const fetchReports = async () => {
    try {
      const all = await Promise.all(
        taskIds.map(id => API.get(`reports/?task=${id}`).then(r => r.data))
      );
      setReports(all.flat());
    } catch {}
  };

  useEffect(() => {
    if (taskIds.length) fetchReports();
  }, [projectId, tasks]);

  const handleReply = async (reportId: number) => {
    const message = reply[reportId]?.trim();
    if (!message) return;
    setSaving(reportId);
    try {
      await API.post(`reports/${reportId}/reply/`, { message });
      setReply(prev => ({ ...prev, [reportId]: '' }));
      fetchReports();
    } catch {}
    finally { setSaving(null); }
  };

  if (!reports.length) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f9fafb', border: '1px dashed #e5e7eb' }}>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          No reports submitted yet for this project's tasks.
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {reports.map(report => (
        <Card key={report.id} sx={{
          borderLeft: `4px solid ${
            report.status === 'complete' ? '#10b981' :
            report.status === 'blocked'  ? '#ef4444' : '#f59e0b'
          }`
        }}>
          <CardContent>
            {/* Report header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {report.task_name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {report.submitted_by_name} · {new Date(report.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Chip
                label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                color={statusColor[report.status] ?? 'default'}
                size="small"
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Message thread */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {report.messages.map(msg => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: msg.sender_role === 'manager' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Avatar sx={{
                    width: 28, height: 28, fontSize: 12,
                    bgcolor: msg.sender_role === 'manager' ? '#6366f1' : '#e5e7eb',
                    color: msg.sender_role === 'manager' ? '#fff' : '#374151',
                  }}>
                    {msg.sender_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{
                    maxWidth: '75%',
                    bgcolor: msg.sender_role === 'manager' ? '#eff6ff' : '#f9fafb',
                    borderRadius: msg.sender_role === 'manager'
                      ? '12px 12px 4px 12px'
                      : '12px 12px 12px 4px',
                    px: 1.5, py: 1,
                    border: '1px solid',
                    borderColor: msg.sender_role === 'manager' ? '#bfdbfe' : '#e5e7eb',
                  }}>
                    <Typography variant="caption" sx={{
                      fontWeight: 600,
                      color: msg.sender_role === 'manager' ? '#3b82f6' : '#6b7280',
                      display: 'block', mb: 0.25,
                    }}>
                      {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1f2937' }}>
                      {msg.message}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Reply box */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
              REPLY
            </Typography>
            <Box display="flex" gap={1} mt={0.75}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={reply[report.id] || ''}
                onChange={e => setReply(prev => ({ ...prev, [report.id]: e.target.value }))}
              />
              <Button
                variant="contained"
                size="small"
                disabled={saving === report.id || !reply[report.id]?.trim()}
                onClick={() => handleReply(report.id)}
                sx={{ alignSelf: 'flex-end', minWidth: 80 }}
              >
                {saving === report.id ? '...' : 'Send'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}