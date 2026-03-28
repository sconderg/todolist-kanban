import { create } from "zustand";
import { Column, Task } from "@/types/task";

interface TaskStore {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isModalOpen: boolean;
    editingTask: Task | null;
    defaultColumn?: Column;
    openModal: (task?: Task, defaultColumn?: Column) => void;
    closeModal: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    isModalOpen: false,
    editingTask: null,
    defaultColumn: undefined,
    openModal: (task, defaultColumn) => set({ isModalOpen: true, editingTask: task || null, defaultColumn }),
    closeModal: () => set({ isModalOpen: false, editingTask: null, defaultColumn: undefined }),
}));