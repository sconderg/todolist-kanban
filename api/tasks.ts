import axios from 'axios';
import { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL

})

export const getTasks = async (
    column?: string,
    search?: string,
    page: number = 1,
    limit: number = 5
): Promise<{ data: Task[]; total: number }> => {
    const params: Record<string, string> = {};
    if (column) params.column = column;
    if (search) params.q = search;
    params._page = String(page);
    params._limit = String(limit);
    params._sort = 'order';
    params._order = 'asc';

    const response = await api.get<Task[]>('/tasks', { params });

    const total = Number(response.headers['x-total-count'] ?? 0);

    return { data: response.data, total };
};

export const createTask = async (task: CreateTaskInput): Promise<Task> => {
    const payload = { ...task, order: task.order ?? Date.now() };
    const { data } = await api.post<Task>('/tasks', payload);
    return data;
}

export const updateTask = async (id: string, task: UpdateTaskInput): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, task);
    return data;
}

export const deleteTask = async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
}