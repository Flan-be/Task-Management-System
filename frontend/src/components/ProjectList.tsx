import React, { useState } from "react";
import { Project } from "../types";
import { Box, Typography, Button, TextField, List, ListItem } from "@mui/material";

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

    return (
        <List disablePadding>
            {projects.map((project) => (
                <ListItem key={project.id} disablePadding sx={{ mb: 1 }}>
                    {showEditForm === project.id ? (
                        <Box display="flex" flexDirection="column" gap={1} width="100%">
                            <TextField size="small" value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} />
                            <TextField size="small" type="number" value={editedPriorityLevel} onChange={(e) => setEditedPriorityLevel(Number(e.target.value))} />
                            <TextField size="small" value={editedProjectDescription} onChange={(e) => setEditedProjectDescription(e.target.value)} />
                            {error && <Typography color="error" variant="caption">{error}</Typography>}
                            <Box display="flex" gap={1}>
                                <Button size="small" variant="contained" onClick={() => handleSaveEdit(project)}>Save</Button>
                                <Button size="small" variant="outlined" onClick={() => { setShowEditForm(null); setError(""); }}>Cancel</Button>
                            </Box>
                        </Box>
                    ) : showDeleteConfirm === project.id ? (
                        <Box>
                            <Typography variant="body2">Delete {project.projectName}?</Typography>
                            <Box display="flex" gap={1} mt={1}>
                                <Button size="small" variant="contained" color="error" onClick={() => { onDelete(project); setShowDeleteConfirm(null); }}>Yes</Button>
                                <Button size="small" variant="outlined" onClick={() => setShowDeleteConfirm(null)}>No</Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            width="100%"
                            p={1}
                            sx={{ cursor: 'pointer', borderRadius: 1, bgcolor: selectedProjectId === project.id ? '#e3f2fd' : 'transparent', '&:hover': { bgcolor: '#f5f5f5' } }}
                            onClick={() => handleSelectProject(project)}
                        >
                            <Typography variant="body1" fontWeight="bold">{project.projectName}</Typography>
                            <Typography variant="caption" color="text.secondary">Priority: {project.priorityLevel}</Typography>
                            <Box display="flex" gap={1} mt={1}>
                                <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); setShowEditForm(project.id); setEditedProjectName(project.projectName); setEditedPriorityLevel(project.priorityLevel); setEditedProjectDescription(project.projectDescription || ""); }}>Edit</Button>
                                <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(project.id); }}>Delete</Button>
                            </Box>
                        </Box>
                    )}
                </ListItem>
            ))}
        </List>
    );
};

export default ProjectList;