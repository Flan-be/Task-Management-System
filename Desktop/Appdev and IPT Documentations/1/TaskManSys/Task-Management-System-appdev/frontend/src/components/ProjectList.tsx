import React, { useState } from "react";
import { Project } from "../types";
import { Box, Typography, Button, TextField, List, ListItem, Card, CardContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ProjectListProps {
    projects: Project[];
    onToggle: (project: Project) => void;
    onDelete: (project: Project) => void;
    onAdd: () => void;
    onSelectProject: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onToggle, onDelete, onSelectProject }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showEditForm, setShowEditForm] = useState<number | null>(null);
    const [editedProjectName, setEditedProjectName] = useState("");
    const [editedPriorityLevel, setEditedPriorityLevel] = useState(1);
    const [editedProjectDescription, setEditedProjectDescription] = useState("");
    const [error, setError] = useState("");

    const handleSelectProject = (project: Project) => {
        setSelectedProjectId(project.id);
        onSelectProject(project);
    };

    const handleSaveEdit = (project: Project) => {
        if (!editedProjectName.trim()) { setError("Name cannot be empty."); return; }
        if (editedPriorityLevel < 1 || editedPriorityLevel > 5) { setError("Priority must be 1-5."); return; }
        onToggle({ ...project, projectName: editedProjectName, priorityLevel: editedPriorityLevel, projectDescription: editedProjectDescription });
        setShowEditForm(null); setError("");
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 4) return '#ef4444';
        if (priority >= 3) return '#f59e0b';
        return '#10b981';
    };

    return (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {projects.length === 0 ? (
                <Typography variant="caption" sx={{ color: '#9ca3af', textAlign: 'center', py: 2 }}>
                    No projects yet
                </Typography>
            ) : (
                projects.map((project) => (
                    <ListItem key={project.id} disablePadding>
                        {showEditForm === project.id ? (
                            <Card sx={{ width: '100%', p: 0 }}>
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1f2937', display: 'block', mb: 1.5 }}>
                                        Edit Project
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        <TextField 
                                            fullWidth
                                            size="small" 
                                            value={editedProjectName} 
                                            onChange={(e) => setEditedProjectName(e.target.value)}
                                            label="Project Name"
                                        />
                                        <TextField 
                                            fullWidth
                                            size="small" 
                                            type="number" 
                                            value={editedPriorityLevel} 
                                            onChange={(e) => setEditedPriorityLevel(Number(e.target.value))}
                                            label="Priority (1-5)"
                                            inputProps={{ min: 1, max: 5 }}
                                        />
                                        <TextField 
                                            fullWidth
                                            size="small" 
                                            value={editedProjectDescription} 
                                            onChange={(e) => setEditedProjectDescription(e.target.value)}
                                            label="Description"
                                            multiline
                                            rows={2}
                                        />
                                        {error && <Typography color="error" variant="caption">{error}</Typography>}
                                        <Box display="flex" gap={1}>
                                            <Button size="small" variant="contained" onClick={() => handleSaveEdit(project)} fullWidth>Save</Button>
                                            <Button size="small" variant="outlined" onClick={() => { setShowEditForm(null); setError(""); }} fullWidth>Cancel</Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : showDeleteConfirm === project.id ? (
                            <Card sx={{ width: '100%', p: 0, bgcolor: '#fef2f2', borderLeft: '3px solid #ef4444' }}>
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7f1d1d', mb: 2 }}>Delete {project.projectName}?</Typography>
                                    <Box display="flex" gap={1}>
                                        <Button size="small" variant="contained" color="error" onClick={() => { onDelete(project); setShowDeleteConfirm(null); }} fullWidth>Yes, Delete</Button>
                                        <Button size="small" variant="outlined" onClick={() => setShowDeleteConfirm(null)} fullWidth>Cancel</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card
                                sx={{ 
                                    width: '100%',
                                    p: 0,
                                    cursor: 'pointer', 
                                    bgcolor: selectedProjectId === project.id ? '#eef2ff' : 'transparent',
                                    borderLeft: `3px solid ${selectedProjectId === project.id ? '#6366f1' : 'transparent'}`,
                                    '&:hover': { bgcolor: '#f9fafb' }
                                }}
                                onClick={() => handleSelectProject(project)}
                            >
                                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" gap={1} mb={1}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937', flex: 1 }}>
                                            {project.projectName}
                                        </Typography>
                                        <Box sx={{ 
                                            bgcolor: getPriorityColor(project.priorityLevel),
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.25,
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            P{project.priorityLevel}
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1.5, minHeight: '1.5em' }}>
                                        {project.projectDescription || 'No description'}
                                    </Typography>
                                    <Box display="flex" gap={0.5}>
                                        <Button 
                                            size="small" 
                                            variant="text"
                                            startIcon={<EditIcon />}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setShowEditForm(project.id); 
                                                setEditedProjectName(project.projectName); 
                                                setEditedPriorityLevel(project.priorityLevel); 
                                                setEditedProjectDescription(project.projectDescription || ""); 
                                            }}
                                            sx={{ flex: 1, fontSize: '0.75rem' }}
                                        >
                                            Edit
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant="text"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setShowDeleteConfirm(project.id); 
                                            }}
                                            sx={{ flex: 1, fontSize: '0.75rem' }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </ListItem>
                ))
            )}
        </List>
    );
};

export default ProjectList;