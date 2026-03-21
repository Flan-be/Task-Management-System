import React, { useState } from "react";
import { Task } from "../types";
import { Box, Typography, Button, TextField, List, ListItem, Checkbox, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { completeTask } from '../APITask.tsx';

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

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Button variant="contained" size="small" onClick={onAdd}>Add Task</Button>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Deadline</InputLabel>
                    <Select
                        value={filter}
                        label="Filter by Deadline"
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                        <MenuItem value="due_today">Due Today</MenuItem>
                        <MenuItem value="due_this_week">Due This Week</MenuItem>
                        <MenuItem value="earliest">Earliest First</MenuItem>
                        <MenuItem value="latest">Latest First</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <List disablePadding>
                {getFilteredTasks().map((task) => (
                    <ListItem key={task.id} disablePadding sx={{ mb: 1 }}>
                        {showEditForm === task.id ? (
                            <Box display="flex" flexDirection="column" gap={1} width="100%">
                                <TextField size="small" label="Task Name" value={editedTaskName} onChange={(e) => setEditedTaskName(e.target.value)} />
                                <TextField size="small" type="number" label="Priority (1-5)" value={editedPriorityLevel} onChange={(e) => setEditedPriorityLevel(Number(e.target.value))} />
                                <TextField size="small" label="Description" value={editedTaskDescription} onChange={(e) => setEditedTaskDescription(e.target.value)} />
                                <TextField size="small" type="datetime-local" value={editedTimeDue} onChange={(e) => setEditedTimeDue(e.target.value)} />
                                <FormControlLabel control={<Checkbox checked={editedOverdue} onChange={(e) => setEditedOverdue(e.target.checked)} />} label="Overdue" />
                                {error && <Typography color="error" variant="caption">{error}</Typography>}
                                <Box display="flex" gap={1}>
                                    <Button size="small" variant="contained" onClick={() => handleSaveEdit(task)}>Save</Button>
                                    <Button size="small" variant="outlined" onClick={() => { setShowEditForm(null); setError(""); }}>Cancel</Button>
                                </Box>
                            </Box>
                        ) : showDeleteConfirm === task.id ? (
                            <Box>
                                <Typography variant="body2">Delete {task.taskName}?</Typography>
                                <Box display="flex" gap={1} mt={1}>
                                    <Button size="small" variant="contained" color="error" onClick={() => { onDelete(task); setShowDeleteConfirm(null); }}>Yes</Button>
                                    <Button size="small" variant="outlined" onClick={() => setShowDeleteConfirm(null)}>No</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box width="100%" p={1} sx={{
                                borderRadius: 1,
                                border: '1px solid #eee',
                                opacity: task.completed ? 0.5 : 1,
                                bgcolor: task.completed ? '#f5f5f5' : 'transparent'
                            }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body1" fontWeight="bold" sx={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
                                        {task.taskName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ flex: 1 }}>Priority: {task.priorityLevel}</Typography>
                                    <Typography variant="caption" sx={{ flex: 1 }}>{task.timeDue}</Typography>
                                    <Typography variant="caption" sx={{ flex: 1 }} color={task.completed ? "text.secondary" : task.overdue ? "error" : "success.main"}>
                                        {task.completed ? "Completed" : task.overdue ? "Overdue" : "On track"}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">{task.taskDescription}</Typography>
                                <Box display="flex" gap={1} mt={1}>
                                    {!task.completed && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            onClick={async () => {
                                                await completeTask(task.id);
                                                onToggle({ ...task, completed: true });
                                            }}
                                        >
                                            Complete
                                        </Button>
                                    )}
                                    {!task.completed && (
                                        <Button size="small" variant="outlined" onClick={() => {
                                            setShowEditForm(task.id);
                                            setEditedTaskName(task.taskName);
                                            setEditedPriorityLevel(task.priorityLevel);
                                            setEditedTaskDescription(task.taskDescription || "");
                                            setEditedTimeDue(task.timeDue);
                                            setEditedOverdue(task.overdue);
                                        }}>Edit</Button>
                                    )}
                                    <Button size="small" variant="outlined" color="error" onClick={() => setShowDeleteConfirm(task.id)}>Delete</Button>
                                </Box>
                            </Box>
                        )}
                    </ListItem>
                ))}
                {getFilteredTasks().length === 0 && (
                    <Typography color="text.secondary" variant="body2">No tasks match this filter.</Typography>
                )}
            </List>
        </Box>
    );
};

export default TaskList;