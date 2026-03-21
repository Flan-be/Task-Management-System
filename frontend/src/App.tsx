import React, { useState, useEffect } from 'react';
import { Project, Task } from './types';
import { getProject, createProject, updateProject, deleteProject } from './APIProject.tsx';
import { getTask, createTask, updateTask, deleteTask, getAllOverdueTasks } from './APITask.tsx';
import ProjectList from './components/ProjectList.tsx';
import TaskList from './components/TaskList.tsx';
import { Box, Typography, TextField, Button, List, ListItem, ThemeProvider, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import { theme } from './theme.ts';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newPriorityLevel, setNewPriorityLevel] = useState(1);
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriorityLevel, setNewTaskPriorityLevel] = useState(1);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskTimeDue, setNewTaskTimeDue] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (selectedProject) fetchTasks(selectedProject.id); }, [selectedProject]);

  const fetchProjects = async () => setProjects(await getProject());
  const fetchTasks = async (projectId: number) => setTasks(await getTask(projectId));
  const fetchAllOverdueTasks = async () => setAllTasks(await getAllOverdueTasks());

  const handleSubmitAddProject = async () => {
    await createProject({ projectName: newProjectName, priorityLevel: newPriorityLevel, projectDescription: newProjectDescription });
    setShowAddProjectForm(false);
    setNewProjectName(""); setNewPriorityLevel(1); setNewProjectDescription("");
    fetchProjects();
  };

  const handleToggleProject = async (project: Project) => {
    await updateProject(project.id, { projectName: project.projectName, priorityLevel: project.priorityLevel, projectDescription: project.projectDescription });
    fetchProjects();
  };

  const handleDeleteProject = async (project: Project) => {
    await deleteProject(project.id);
    setSelectedProject(null); setTasks([]); fetchProjects();
  };

  const handleSubmitAddTask = async () => {
    if (!selectedProject) return;
    console.log("Raw input:", newTaskTimeDue);
    console.log("Converted UTC:", new Date(newTaskTimeDue).toISOString());
    await createTask({
      taskName: newTaskName,
      priorityLevel: newTaskPriorityLevel,
      taskDescription: newTaskDescription,
      timeDue: new Date(newTaskTimeDue).toISOString(),
      overdue: false,
      completed: false,
      project: selectedProject.id,
    });
    setShowAddTaskForm(false);
    setNewTaskName(""); setNewTaskPriorityLevel(1); setNewTaskDescription(""); setNewTaskTimeDue("");
    fetchTasks(selectedProject.id);
};

  const handleToggleTask = async (task: Task) => {
    await updateTask(task.id, { taskName: task.taskName, priorityLevel: task.priorityLevel, taskDescription: task.taskDescription, timeDue: task.timeDue, overdue: task.overdue, project: task.project });
    if (selectedProject) fetchTasks(selectedProject.id);
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    if (selectedProject) fetchTasks(selectedProject.id);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Header */}
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)' }}>
          <Toolbar sx={{ py: 2 }}>
            <ChecklistIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px', flex: 1 }}>
              Task Manager
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Stay organized and productive
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box display="flex" flex={1} overflow="hidden">
          {/* Projects Sidebar */}
          <Box 
            sx={{ 
              width: 280, 
              borderRight: '1px solid #e5e7eb',
              bgcolor: '#ffffff',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1f2937' }}>
                Projects
              </Typography>

              {/* Overdue Button */}
              <Button
                variant={showOverdue ? "contained" : "outlined"}
                color="error"
                size="small"
                fullWidth
                startIcon={<WarningIcon />}
                onClick={() => { setShowOverdue(!showOverdue); if (!showOverdue) fetchAllOverdueTasks(); }}
                sx={{ mb: 2 }}
              >
                {showOverdue ? "Hide Overdue" : "Overdue"}
              </Button>

              {/* Add Project Button */}
              <Button 
                variant="contained" 
                size="small" 
                fullWidth 
                onClick={() => setShowAddProjectForm(true)} 
                startIcon={<AddCircleOutlineIcon />}
                sx={{ mb: 3 }}
              >
                New Project
              </Button>

              {/* Add Project Form */}
              {showAddProjectForm && (
                <Card sx={{ mb: 3, p: 0 }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#1f2937' }}>
                      Create New Project
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <TextField 
                        fullWidth
                        size="small" 
                        label="Project Name" 
                        value={newProjectName} 
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g., Website Redesign"
                      />
                      <TextField 
                        fullWidth
                        size="small" 
                        type="number" 
                        label="Priority (1-5)" 
                        value={newPriorityLevel} 
                        onChange={(e) => setNewPriorityLevel(Number(e.target.value))}
                        inputProps={{ min: 1, max: 5 }}
                      />
                      <TextField 
                        fullWidth
                        size="small" 
                        label="Description" 
                        value={newProjectDescription} 
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        multiline
                        rows={2}
                      />
                      <Box display="flex" gap={1}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={handleSubmitAddProject}
                          fullWidth
                        >
                          Create
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => setShowAddProjectForm(false)}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Projects List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <ProjectList
                  projects={projects}
                  onToggle={handleToggleProject}
                  onDelete={handleDeleteProject}
                  onAdd={() => setShowAddProjectForm(true)}
                  onSelectProject={setSelectedProject}
                />
              </Box>
            </Box>
          </Box>

          {/* Main Content Area */}
          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 4, minHeight: '100%' }}>
              {showOverdue ? (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WarningIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        Overdue Tasks
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      Tasks that need your immediate attention
                    </Typography>
                  </Box>

                  {allTasks.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="body1" sx={{ color: '#059669', fontWeight: 500 }}>
                        ✓ No overdue tasks! Great work!
                      </Typography>
                    </Card>
                  ) : (
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {allTasks.map((task) => (
                        <ListItem key={task.id} disablePadding>
                          <Card sx={{ width: '100%', bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                              <Box display="flex" justifyContent="space-between" alignItems="start" gap={2}>
                                <Box flex={1}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                                    {task.taskName}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5, mb: 1 }}>
                                    {task.taskDescription}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Typography variant="caption" sx={{ bgcolor: '#fee2e2', color: '#991b1b', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 500 }}>
                                      Priority: {task.priorityLevel}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 500 }}>
                                      Due: {new Date(task.timeDue).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ) : selectedProject ? (
                <Box>
                  {/* Project Header */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                      {selectedProject.projectName}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                      {selectedProject.projectDescription || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Box sx={{ bgcolor: '#f3f4f6', px: 2, py: 1, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          Priority: <span style={{ fontWeight: 700, color: '#1f2937' }}>{selectedProject.priorityLevel}/5</span>
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#f3f4f6', px: 2, py: 1, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          Tasks: <span style={{ fontWeight: 700, color: '#1f2937' }}>{tasks.length}</span>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Add Task Form */}
                  {showAddTaskForm && (
                    <Card sx={{ mb: 4, p: 0 }}>
                      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#1f2937' }}>
                          Create New Task
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          <TextField 
                            fullWidth
                            size="small" 
                            label="Task Name" 
                            value={newTaskName} 
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="e.g., Design homepage"
                          />
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                            <TextField 
                              size="small" 
                              type="number" 
                              label="Priority (1-5)" 
                              value={newTaskPriorityLevel} 
                              onChange={(e) => setNewTaskPriorityLevel(Number(e.target.value))}
                              inputProps={{ min: 1, max: 5 }}
                            />
                            <TextField 
                              size="small" 
                              type="datetime-local" 
                              label="Due Date"
                              value={newTaskTimeDue} 
                              onChange={(e) => setNewTaskTimeDue(e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Box>
                          <TextField 
                            fullWidth
                            size="small" 
                            label="Description" 
                            value={newTaskDescription} 
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            multiline
                            rows={2}
                          />
                          <Box display="flex" gap={1}>
                            <Button 
                              variant="contained" 
                              size="small" 
                              onClick={handleSubmitAddTask}
                              fullWidth
                            >
                              Create Task
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => setShowAddTaskForm(false)}
                              fullWidth
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tasks List */}
                  <Box>
                    <TaskList
                      tasks={tasks}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      onAdd={() => setShowAddTaskForm(true)}
                      projectId={selectedProject.id}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                  <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400, bgcolor: '#f0f9ff', border: '2px dashed #0284c7' }}>
                    <ChecklistIcon sx={{ fontSize: 48, color: '#0284c7', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0c4a6e', mb: 1 }}>
                      Select a Project
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0c4a6e' }}>
                      Choose a project from the left sidebar to view and manage its tasks
                    </Typography>
                  </Card>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;