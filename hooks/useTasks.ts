import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask } from '@/api/tasks';
import { CreateTaskInput, UpdateTaskInput, Column, Task } from '@/types/task';

export const taskKeys = {
    all: ['tasks'] as const,
    byColumn: (column: Column, search: string) =>
        ['tasks', column, search] as const,
};

export const useColumnTasks = (column: Column, search: string) => {
    return useInfiniteQuery({
        queryKey: taskKeys.byColumn(column, search),
        queryFn: ({ pageParam = 1 }) => getTasks(column, search, pageParam, 5),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            const maxPages = Math.ceil(lastPage.total / 5);
            return lastPageParam < maxPages ? lastPageParam + 1 : undefined;
        },
    });
};
export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateTaskInput) => createTask(input),
        onMutate: async (newInput) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.all });
            const previousQueries = queryClient.getQueriesData<any>({ queryKey: taskKeys.all });

            const optimisticTask: Task = {
                id: `temp-${Date.now()}`,
                title: newInput.title,
                description: newInput.description || '',
                column: newInput.column,
                order: newInput.order || 0,
            };

            previousQueries.forEach(([queryKey, data]) => {
                if (!data?.pages || queryKey[1] !== newInput.column) return;
                
                const newPages = data.pages.map((page: any, index: number) => {
                    if (index === 0) {
                        const tasksArray = page.data || page.tasks || [];
                        const newTasksArray = [...tasksArray, optimisticTask].sort((a: Task, b: Task) => a.order - b.order);
                        return { ...page, data: newTasksArray, total: (page.total || 0) + 1 };
                    }
                    return page;
                });
                
                queryClient.setQueryData(queryKey, { ...data, pages: newPages });
            });

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskInput }) =>
            updateTask(id, updates),
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.all });
            const previousQueries = queryClient.getQueriesData<any>({ queryKey: taskKeys.all });

            let taskToMove: Task | null = null;
            for (const [_, data] of previousQueries) {
                if (!data?.pages) continue;
                for (const page of data.pages) {
                    const tasksArray = page.data || page.tasks;
                    const found = tasksArray?.find((t: Task) => t.id === id);
                    if (found) {
                        taskToMove = { ...found, ...updates };
                        break;
                    }
                }
                if (taskToMove) break;
            }

            if (taskToMove) {
                const targetColumn = updates.column || taskToMove.column;

                previousQueries.forEach(([queryKey, data]) => {
                    if (!data?.pages) return;
                    
                    const isTargetQuery = queryKey[1] === targetColumn;
                    
                    const newPages = data.pages.map((page: any) => {
                        const tasksArray = page.data || page.tasks;
                        if (!tasksArray) return page;

                        const newTasksArray = tasksArray.filter((t: Task) => t.id !== id);
                        return { ...page, data: newTasksArray };
                    });

                    if (isTargetQuery && newPages.length > 0) {
                        newPages[0].data.push(taskToMove);
                        newPages[0].data.sort((a: Task, b: Task) => a.order - b.order);
                    }

                    queryClient.setQueryData(queryKey, { ...data, pages: newPages });
                });
            }

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
};