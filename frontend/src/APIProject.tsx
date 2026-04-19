import API from "./API.tsx";
import { Project } from "./types";

export const getProject = async (): Promise<Project[]> => {
    const response = await API.get<Project[]>("projects/");
    return response.data;
}

export const createProject = async (project: Omit<Project, 'id' | 'tasks'>): Promise<Project> => {
    const response = await API.post<Project>("projects/", project);
    return response.data;
}

export const updateProject = async (id: number, project: Omit<Project, 'id' | 'tasks'>): Promise<Project> => {
    const response = await API.put<Project>(`projects/${id}/`, project);
    return response.data;
}

export const deleteProject = async (id: number): Promise<void> => {
    await API.delete(`projects/${id}/`);
}