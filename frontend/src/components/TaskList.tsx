import React, { useState } from "react";
import { Task } from "../types";
import { Box, Typography, Button, TextField, List, ListItem, Checkbox, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Card, CardContent } from "@mui/material";
import { completeTask } from '../APITask.tsx';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface TaskListProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
    onDelete: (task: Task) => void;
    onAdd: () => void;
    projectId: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onDelete, onAdd }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showEditForm, setShowEditForm] = useState<number | null>(null);
    const [editedTaskName, setEditedTaskName] = useState("");
    const [editedPriorityLevel, setEditedPriorityLevel] = useState(1);
    const [editedTaskDescription, setEditedTaskDescription] = useState("");
    const [editedTimeDue, setEditedTimeDue] = useState("");
    const [editedOverdue, setEditedOverdue] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<string>("all");

    const getFilteredTasks = () => {
        const now = new Date();
        let filtered = [...tasks];
        switch (filter) {
            case "overdue":
                filtered = filtered.filter(task => task.overdue || new Date(task.timeDue) < now);
                break;
            case "due_today":
                filtered = filtered.filter(task => {
                    const due = new Date(task.timeDue);
                    return due.toDateString() === now.toDateString();
                });
                break;
            case "due_this_week":
                const weekFromNow = new Date();
                weekFromNow.setDate(now.getDate() + 7);
                filtered = filtered.filter(task => {
                    const due = new Date(task.timeDue);
                    return due >= now && due <= weekFromNow;
                });
                break;
            case "earliest":
                filtered.sort((a, b) => new Date(a.timeDue).getTime() - new Date(b.timeDue).getTime());
                break;
            case "latest":
                filtered.sort((a, b) => new Date(b.timeDue).getTime() - new Date(a.timeDue).getTime());
                break;
            default:
                break;
        }
        return filtered;
    };

    const handleSaveEdit = (task: Task) => {
        if (!editedTaskName.trim()) { setError("Name cannot be empty."); return; }
        if (editedPriorityLevel < 1 || editedPriorityLevel > 5) { setError("Priority must be 1-5."); return; }
        onToggle({ ...task, taskName: editedTaskName, priorityLevel: editedPriorityLevel, taskDescription: editedTaskDescription, timeDue: editedTimeDue, overdue: editedOverdue, project: task.project });
        setShowEditForm(null); setError("");
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 4) return '#ef4444';
        if (priority >= 3) return '#f59e0b';
        return '#10b981';
    };

    const getStatusColor = (task: Task) => {
        if (task.completed) return '#10b981';
        if (task.overdue) return '#ef4444';
        return '#6366f1';
    };

    const getStatusText = (task: Task) => {
        if (task.completed) return '✓ Done';
        if (task.overdue) return '⚠ Overdue';
        return '→ In Progress';
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button 
                    variant="contained" 
                    size="small" 
                    onClick={onAdd}
                    startIcon={<CheckCircleOutlineIcon />}
                >
                    Add Task
                </Button>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select
                        value={filter}
                        label="Filter"
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Tasks</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                        <MenuItem value="due_today">Due Today</MenuItem>
                        <MenuItem value="due_this_week">Due This Week</MenuItem>
                        <MenuItem value="earliest">Earliest First</MenuItem>
                        <MenuItem value="latest">Latest First</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {getFilteredTasks().map((task) => (
                    <ListItem key={task.id} disablePadding>
                        {showEditForm === task.id ? (
                            <Card sx={{ width: '100%', p: 0 }}>
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1f2937', display: 'block', mb: 1.5 }}>
                                        Edit Task
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        <TextField 
                                            fullWidth
                                            size="small" 
                                            label="Task Name" 
                                            value={editedTaskName} 
                                            onChange={(e) => setEditedTaskName(e.target.value)}
                                        />
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                            <TextField 
                                                size="small" 
                                                type="number" 
                                                label="Priority (1-5)" 
                                                value={editedPriorityLevel} 
                                                onChange={(e) => setEditedPriorityLevel(Number(e.target.value))}
                                                inputProps={{ min: 1, max: 5 }}
                                            />
                                            <TextField 
                                                size="small" 
                                                type="datetime-local" 
                                                value={editedTimeDue} 
                                                onChange={(e) => setEditedTimeDue(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                label="Due Date"
                                            />
                                        </Box>
                                        <TextField 
                                            fullWidth
                                            size="small" 
                                            label="Description" 
                                            value={editedTaskDescription} 
                                            onChange={(e) => setEditedTaskDescription(e.target.value)}
                                            multiline
                                            rows={2}
                                        />
                                        <FormControlLabel 
                                            control={<Checkbox checked={editedOverdue} onChange={(e) => setEditedOverdue(e.target.checked)} />} 
                                            label="Mark as Overdue" 
                                        />
                                        {error && <Typography color="error" variant="caption">{error}</Typography>}
                                        <Box display="flex" gap={1}>
                                            <Button size="small" variant="contained" onClick={() => handleSaveEdit(task)} fullWidth>Save</Button>
                                            <Button size="small" variant="outlined" onClick={() => { setShowEditForm(null); setError(""); }} fullWidth>Cancel</Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : showDeleteConfirm === task.id ? (
                            <Card sx={{ width: '100%', p: 0, bgcolor: '#fef2f2', borderLeft: '3px solid #ef4444' }}>
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7f1d1d', mb: 2 }}>Delete {task.taskName}?</Typography>
                                    <Box display="flex" gap={1}>
                                        <Button size="small" variant="contained" color="error" onClick={() => { onDelete(task); setShowDeleteConfirm(null); }} fullWidth>Yes, Delete</Button>
                                        <Button size="small" variant="outlined" onClick={() => setShowDeleteConfirm(null)} fullWidth>Cancel</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card sx={{ 
                                width: '100%',
                                p: 0,
                                opacity: task.completed ? 0.7 : 1,
                                bgcolor: task.completed ? '#f0fdf4' : task.overdue ? '#fef2f2' : '#ffffff',
                                borderLeft: `4px solid ${getStatusColor(task)}`,
                            }}>
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" gap={2} mb={1}>
                                        <Box flex={1}>
                                            <Typography variant="h6" sx={{ 
                                                fontWeight: 700, 
                                                color: '#1f2937',
                                                textDecoration: task.completed ? 'line-through' : 'none',
                                                textDecorationColor: '#d1d5db'
                                            }}>
                                                {task.taskName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ 
                                            bgcolor: getPriorityColor(task.priorityLevel),
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.25,
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            P{task.priorityLevel}
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5 }}>
                                        {task.taskDescription}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ScheduleIcon sx={{ fontSize: '0.875rem', color: '#6b7280' }} />
                                            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                                                {new Date(task.timeDue).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ 
                                            bgcolor: getStatusColor(task),
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.25,
                                            borderRadius: 1,
                                            fontWeight: 500
                                        }}>
                                            {getStatusText(task)}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={0.5}>
                                        {!task.completed && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleOutlineIcon />}
                                                onClick={async () => {
                                                    await completeTask(task.id);
                                                    onToggle({ ...task, completed: true });
                                                }}
                                                sx={{ flex: 1, fontSize: '0.75rem' }}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                        {!task.completed && (
                                            <Button 
                                                size="small" 
                                                variant="text"
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    setShowEditForm(task.id);
                                                    setEditedTaskName(task.taskName);
                                                    setEditedPriorityLevel(task.priorityLevel);
                                                    setEditedTaskDescription(task.taskDescription || "");
                                                    setEditedTimeDue(task.timeDue);
                                                    setEditedOverdue(task.overdue);
                                                }}
                                                sx={{ flex: 1, fontSize: '0.75rem' }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        <Button 
                                            size="small" 
                                            variant="text"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => setShowDeleteConfirm(task.id)}
                                            sx={{ flex: 1, fontSize: '0.75rem' }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </ListItem>
                ))}
                {getFilteredTasks().length === 0 && (
                    <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f9fafb', border: '1px dashed #d1d5db' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            No tasks match this filter. Create one to get started!
                        </Typography>
                    </Card>
                )}
            </List>
        </Box>
    );
};

export default TaskList;