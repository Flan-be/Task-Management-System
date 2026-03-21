import axios from "axios";
import {Task} from "./types";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

export const getTask = async (projectId: number): Promise<Task[]> => {
    const response = await API.get<Task[]>(`tasks/?project=${projectId}`);
    return response.data;
}

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await API.post<Task>("tasks/", task);
    return response.data;
}   

export const updateTask = async (
    id: number,
    data: Partial<Task>
): Promise<Task> => {
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