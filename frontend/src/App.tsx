import React, { useState, useEffect } from 'react';
import { Project, Task } from './types';
import { getProject, createProject, updateProject, deleteProject } from './APIProject.tsx';
import { getTask, createTask, updateTask, deleteTask, getAllOverdueTasks } from './APITask.tsx';
import ProjectList from './components/ProjectList.tsx';
import TaskList from './components/TaskList.tsx';
import { Box, Typography, TextField, Button, Divider, List, ListItem } from '@mui/material';

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
    <Box display="flex" height="100vh" fontFamily="sans-serif">

      {/* Projects Column */}
      <Box width="250px" borderRight="1px solid #ccc" p={2} overflow="auto">
        <Typography variant="h6" mb={2}>Projects</Typography>

        <Button
          variant={showOverdue ? "contained" : "outlined"}
          color="error"
          size="small"
          onClick={() => { setShowOverdue(!showOverdue); if (!showOverdue) fetchAllOverdueTasks(); }}
          sx={{ mb: 1, width: '100%' }}
        >
          {showOverdue ? "Hide Overdue" : "View Overdue Tasks"}
        </Button>

        <Button variant="contained" size="small" onClick={() => setShowAddProjectForm(true)} sx={{ mb: 2, width: '100%' }}>
          Add Project
        </Button>

        {showAddProjectForm && (
          <Box display="flex" flexDirection="column" gap={1} mb={2}>
            <TextField size="small" label="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
            <TextField size="small" type="number" label="Priority (1-5)" value={newPriorityLevel} onChange={(e) => setNewPriorityLevel(Number(e.target.value))} />
            <TextField size="small" label="Description" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} />
            <Box display="flex" gap={1}>
              <Button variant="contained" size="small" onClick={handleSubmitAddProject}>Submit</Button>
              <Button variant="outlined" size="small" onClick={() => setShowAddProjectForm(false)}>Cancel</Button>
            </Box>
          </Box>
        )}

        <ProjectList
          projects={projects}
          onToggle={handleToggleProject}
          onDelete={handleDeleteProject}
          onAdd={() => setShowAddProjectForm(true)}
          onSelectProject={setSelectedProject}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Main Content */}
      <Box flex={1} p={2} overflow="auto">
        {showOverdue ? (
          <>
            <Typography variant="h6" mb={2} color="error">All Overdue Tasks</Typography>
            {allTasks.length === 0 ? (
              <Typography color="text.secondary">No overdue tasks!</Typography>
            ) : (
              <List disablePadding>
                {allTasks.map((task) => (
                  <ListItem key={task.id} disablePadding sx={{ mb: 1 }}>
                    <Box width="100%" p={1} sx={{ borderRadius: 1, border: '1px solid #ffcdd2' }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">{task.taskName}</Typography>
                        <Typography variant="caption" color="error">Due: {task.timeDue}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{task.taskDescription}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : selectedProject ? (
          <>
            <Typography variant="h6" mb={2}>{selectedProject.projectName} — {selectedProject.projectDescription}</Typography>

            {showAddTaskForm && (
              <Box display="flex" flexDirection="column" gap={1} mb={2} maxWidth="400px">
                <TextField size="small" label="Task Name" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} />
                <TextField size="small" type="number" label="Priority (1-5)" value={newTaskPriorityLevel} onChange={(e) => setNewTaskPriorityLevel(Number(e.target.value))} />
                <TextField size="small" label="Description" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
                <TextField size="small" type="datetime-local" value={newTaskTimeDue} onChange={(e) => setNewTaskTimeDue(e.target.value)} />
                <Box display="flex" gap={1}>
                  <Button variant="contained" size="small" onClick={handleSubmitAddTask}>Submit</Button>
                  <Button variant="outlined" size="small" onClick={() => setShowAddTaskForm(false)}>Cancel</Button>
                </Box>
              </Box>
            )}

            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onAdd={() => setShowAddTaskForm(true)}
              projectId={selectedProject.id}
            />
          </>
        ) : (
          <Typography color="text.secondary">Select a project to view tasks</Typography>
        )}
      </Box>

    </Box>
  );
};

export default App;