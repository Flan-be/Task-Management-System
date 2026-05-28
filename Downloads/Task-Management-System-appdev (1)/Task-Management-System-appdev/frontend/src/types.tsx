export interface Project {
    id: number;
    projectName: string;
    priorityLevel: number;
    projectDescription: string;
    tasks?: Task[];
}

export interface Task {
    id: number;
    taskName: string;
    priorityLevel: number;
    timeDue: string;
    overdue: boolean;
    completed: boolean;
    taskDescription?: string;
    project: number;
}