"use client";

import { Box, Typography, CircularProgress } from '@mui/material';
import { Column as ColumnType } from '@/types/task';
import Column from './Column';
import SearchBar from './SearchBar';
import TaskModal from './TaskModal';
import { DragDropProvider } from '@dnd-kit/react';
import { useUpdateTask } from '@/hooks/useTasks';
import { useColumns } from '@/hooks/useColumns';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/task';

export default function Board() {
    const { mutate: updateTask } = useUpdateTask();
    const queryClient = useQueryClient();
    const { data: columns, isLoading: isColumnsLoading } = useColumns();

    const findTask = (taskId: string) => {
        const queries = queryClient.getQueriesData<any>({ queryKey: ['tasks'] });
        for (const [_, cachedData] of queries) {
            if (!cachedData?.pages) continue;
            for (const page of cachedData.pages) {
                const tasksArray = page.data || page.tasks;
                if (!tasksArray) continue;
                const task = tasksArray.find((t: Task) => t.id === taskId);
                if (task) return task;
            }
        }
        return null;
    };

    const getColumnTasks = (colId: string) => {
        const queries = queryClient.getQueriesData<any>({ queryKey: ['tasks', colId] });
        for (const [_, cachedData] of queries) {
            if (!cachedData?.pages) continue;
            let tasks: Task[] = [];
            for (const page of cachedData.pages) {
                const tasksArray = page.data || page.tasks;
                if (tasksArray) {
                    tasks = tasks.concat(tasksArray);
                }
            }
            if (tasks.length > 0) return tasks;
        }
        return [];
    };

    const handleDragEnd = (event: any) => {
        if (event.canceled) return;

        const sourceId = event.operation.source?.id as string;
        const targetId = event.operation.target?.id as string;

        if (!sourceId || !targetId) return;
        if (sourceId === targetId) return;

        const sourceTask = findTask(sourceId);
        if (!sourceTask) return;

        const isTargetColumn = columns?.some(c => c.id === targetId) ?? false;
        let newColumn = isTargetColumn ? targetId : undefined;
        let newOrder: number | undefined = undefined;

        if (isTargetColumn) {
            const colTasks = getColumnTasks(targetId);
            if (colTasks.length > 0) {
                newOrder = colTasks[colTasks.length - 1].order + 1000;
            } else {
                newOrder = 1000;
            }
        } else {
            const targetTask = findTask(targetId);
            if (!targetTask) return;
            
            newColumn = targetTask.column;
            const colTasks = getColumnTasks(newColumn as string);
            const targetIndex = colTasks.findIndex(t => t.id === targetId);
            const sourceIndex = sourceTask.column === newColumn ? colTasks.findIndex(t => t.id === sourceId) : -1;

            if (targetIndex !== -1) {
                let isAfter = sourceIndex !== -1 && sourceIndex < targetIndex;
                
                if (isAfter) {
                    const nextTaskOrder = targetIndex < colTasks.length - 1 ? colTasks[targetIndex + 1].order : targetTask.order + 2000;
                    newOrder = (targetTask.order + nextTaskOrder) / 2;
                } else {
                    const prevTaskOrder = targetIndex > 0 ? colTasks[targetIndex - 1].order : 0;
                    newOrder = (prevTaskOrder + targetTask.order) / 2;
                }
            }
        }

        if (newColumn && newOrder !== undefined) {
            updateTask({ id: sourceId, updates: { column: newColumn as any, order: newOrder } });
        }
    };
    return (
        <DragDropProvider onDragEnd={handleDragEnd}>
            <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <Box 
                    display="flex" 
                    flexDirection={{ xs: 'column', md: 'row' }} 
                    alignItems={{ xs: 'flex-start', md: 'center' }} 
                    justifyContent="space-between" 
                    mb={{ xs: 4, md: 6 }}
                    gap={{ xs: 2.5, md: 0 }}
                >
                    <Box>
                        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                            <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: '#6366f1', transform: 'rotate(45deg)' }} />
                            <Typography variant="h4" fontWeight={800} letterSpacing={-1} sx={{ color: '#0f172a' }}>
                                Kanban
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>
                            Focus on what matters, beautifully.
                        </Typography>
                    </Box>
                    <Box width={{ xs: '100%', md: 'auto' }}>
                        <SearchBar />
                    </Box>
                </Box>

                <Box 
                    display="flex" 
                    gap={3}
                    alignItems="flex-start" 
                    sx={{ 
                        overflowX: 'auto', 
                        pb: 4,
                        px: 0.5,
                        // Smooth custom scrollbar
                        '&::-webkit-scrollbar': { height: 8 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4, border: '2px solid #f8fafc', '&:hover': { bgcolor: '#94a3b8' } },
                    }}
                >
                    {isColumnsLoading ? (
                        <CircularProgress sx={{ display: 'block', m: 'auto', mt: 10 }} />
                    ) : (
                        columns?.map((col) => (
                            <Column key={col.id} column={col} />
                        ))
                    )}
                </Box>
                <TaskModal />
            </Box>
        </DragDropProvider>
    );
}