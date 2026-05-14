import API from "./API.tsx";
import { Task } from "./types";

export const getTask = async (projectId: number): Promise<Task[]> => {
    const response = await API.get<Task[]>(`tasks/?project=${projectId}`);
    return response.data;
}

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await API.post<Task>("tasks/", task);
    return response.data;
}

export const updateTask = async (id: number, data: Partial<Task>): Promise<Task> => {
    const response = await API.put<Task>(`tasks/${id}/`, data);
    return response.data;
}

export const deleteTask = async (id: number): Promise<void> => {
    await API.delete(`tasks/${id}/`);
}

export const getAllOverdueTasks = async (): Promise<Task[]> => {
    const response = await API.get<Task[]>("tasks/?overdue=true");
    return response.data;
}

export const completeTask = async (id: number): Promise<Task> => {
    const response = await API.patch<Task>(`tasks/${id}/`, { completed: true });
    return response.data;
}

export const assignMember = async (projectId: number, taskId: number, userId: number) => {
    await API.post(`projects/${projectId}/assign-task/`, { task: taskId, user: userId });
};

export const unassignMember = async (projectId: number, taskId: number, userId: number) => {
    await API.delete(`projects/${projectId}/assign-task/`, { data: { task: taskId, user: userId } });
};

export const getTaskAssignees = async (taskId: number) => {
    const res = await API.get(`assignments/?task=${taskId}`);
    return res.data;
};