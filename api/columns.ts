import axios from 'axios';
import { ColumnData } from '@/types/task';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});

export const getColumns = async (): Promise<ColumnData[]> => {
    const { data } = await api.get<ColumnData[]>('/columns');
    return data;
};

export const updateColumn = async (id: string, updates: Partial<ColumnData>): Promise<ColumnData> => {
    const { data } = await api.patch<ColumnData>(`/columns/${id}`, updates);
    return data;
};
