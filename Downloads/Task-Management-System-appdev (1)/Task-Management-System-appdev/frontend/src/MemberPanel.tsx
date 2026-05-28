import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent,
  List, ListItem, ListItemText, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Select,
  MenuItem, FormControl, InputLabel, Alert, Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import API from './API.tsx';
import { Task } from './types';

type Member = {
  id: number;
  name: string;
  email: string;
  joined_at: string;
  assigned_tasks: {
    id: number;
    task_id: number;
    task_name: string;
    completed: boolean;
    overdue: boolean;
  }[];
};

type NewCredentials = {
  name: string;
  email: string;
  password: string;
};

export default function MemberPanel({
  projectId,
  tasks,
}: {
  projectId: number;
  tasks: Task[];
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [credentials, setCredentials] = useState<NewCredentials | null>(null);
  const [assignDialog, setAssignDialog] = useState<Member | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | ''>('');
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await API.get(`projects/${projectId}/members/`);
      setMembers(res.data);
    } catch {
      setMembers([]);
    }
  };

  useEffect(() => { fetchMembers(); }, [projectId]);

  const handleCreateMember = async () => {
    setError('');
    try {
      const res = await API.post(`projects/${projectId}/members/`, {
        name: newName,
        email: newEmail,
      });
      setCredentials(res.data);
      setNewName('');
      setNewEmail('');
      setShowAddForm(false);
      fetchMembers();
    } catch (err: any) {
      setError(err?.response?.data?.email?.[0] || 'Failed to create member.');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    await API.delete(`projects/${projectId}/members/${userId}/`);
    fetchMembers();
  };

  const handleAssignTask = async () => {
    if (!assignDialog || selectedTask === '') return;
    await API.post(`projects/${projectId}/assign-task/`, {
      task: selectedTask,
      user: assignDialog.id,
    });
    setAssignDialog(null);
    setSelectedTask('');
    fetchMembers();
  };

  const handleUnassignTask = async (taskId: number, userId: number) => {
    await API.delete(`projects/${projectId}/assign-task/`, {
      data: { task: taskId, user: userId }
    });
    fetchMembers();
  };

  const unassignedTasks = (member: Member) =>
    tasks.filter(t => !member.assigned_tasks.find(a => a.task_id === t.id));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700} color="#1f2937">
          Members
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Member
        </Button>
      </Box>

      {/* Credentials dialog shown once after creation */}
      {credentials && (
        <Alert
          severity="success"
          onClose={() => setCredentials(null)}
          sx={{ mb: 2 }}
        >
          <Typography fontWeight={700}>Account created! Save these credentials:</Typography>
          <Typography variant="body2">Email: <strong>{credentials.email}</strong></Typography>
          <Typography variant="body2">Password: <strong>{credentials.password}</strong></Typography>
          <Typography variant="caption" color="text.secondary">
            This password will not be shown again.
          </Typography>
        </Alert>
      )}

      {/* Add member form */}
      {showAddForm && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" fontWeight={600} mb={2}>
              Create Member Account
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            <Box display="flex" flexDirection="column" gap={1.5}>
              <TextField
                size="small" fullWidth label="Full Name"
                value={newName} onChange={e => setNewName(e.target.value)}
              />
              <TextField
                size="small" fullWidth label="Email"
                value={newEmail} onChange={e => setNewEmail(e.target.value)}
              />
              <Box display="flex" gap={1}>
                <Button variant="contained" size="small" fullWidth onClick={handleCreateMember}>
                  Create
                </Button>
                <Button variant="outlined" size="small" fullWidth onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No members yet. Add one to get started.
        </Typography>
      ) : (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {members.map(member => (
            <ListItem key={member.id} disablePadding>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography fontWeight={700}>{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => { setAssignDialog(member); setSelectedTask(''); }}
                        title="Assign Task"
                      >
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove Member"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Assigned tasks */}
                  {member.assigned_tasks.length > 0 && (
                    <Box mt={1.5}>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        ASSIGNED TASKS
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={0.5}>
                        {member.assigned_tasks.map(t => (
                          <Chip
                            key={t.id}
                            label={t.task_name}
                            size="small"
                            color={t.completed ? 'success' : t.overdue ? 'error' : 'primary'}
                            variant="outlined"
                            onDelete={() => handleUnassignTask(t.task_id, member.id)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}

      {/* Assign task dialog */}
      <Dialog open={!!assignDialog} onClose={() => setAssignDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Task to {assignDialog?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Select Task</InputLabel>
            <Select
              value={selectedTask}
              label="Select Task"
              onChange={e => setSelectedTask(e.target.value as number)}
            >
              {assignDialog && unassignedTasks(assignDialog!).map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.taskName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {assignDialog && unassignedTasks(assignDialog!).length === 0 && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              All tasks are already assigned to this member.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignTask}
            disabled={selectedTask === ''}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}