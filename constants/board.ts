import { Column, Priority } from '@/types/task';

export const BOARD_COLUMNS: Record<Column, { id: Column; label: string; color: string }> = {
    backlog: { id: 'backlog', label: 'Backlog', color: '#94a3b8' },
    in_progress: { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
    review: { id: 'review', label: 'In Review', color: '#6366f1' },
    done: { id: 'done', label: 'Done', color: '#22c55e' },
};

export const BOARD_COLUMN_IDS = Object.keys(BOARD_COLUMNS) as Column[];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    low: { label: 'Low', color: '#3b82f6' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#ef4444' },
};

export const PRIORITY_OPTIONS = Object.keys(PRIORITY_CONFIG) as Priority[];

export const COLUMN_COLOR_PRESETS = [
    { label: 'Gray', value: '#9ca3af' },
    { label: 'Brown', value: '#a16207' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Yellow', value: '#eab308' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Red', value: '#ef4444' },
];
