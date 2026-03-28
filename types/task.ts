export type Column = string;

export interface ColumnData {
    id: Column;
    label: string;
    color: string;
}
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    column: Column;
    priority?: Priority;
    order: number;
}

export type CreateTaskInput = Omit<Task, 'id' | 'order'> & { order?: number };
export type UpdateTaskInput = Partial<Omit<Task, 'id'>>;