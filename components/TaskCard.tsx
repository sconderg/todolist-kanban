"use client";

import { useSortable } from '@dnd-kit/react/sortable';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/useTaskStore';
import { BOARD_COLUMNS, PRIORITY_CONFIG } from '@/constants/board';

interface TaskCardProps {
    task: Task;
    index: number;
    columnColor: string;
}
export default function TaskCard({ task, index, columnColor }: TaskCardProps) {
    const openModal = useTaskStore((s) => s.openModal);
    const { ref: sortableRef, isDragging, isDropTarget } = useSortable({
        id: task.id,
        index,
        // @ts-ignore
        data: { type: 'task', task },
    });

    return (
        <Card
            ref={sortableRef}
            elevation={0}
            onClick={() => openModal(task)}
            sx={{
                bgcolor: `${columnColor}50`,
                border: `1px solid ${columnColor}40`,
                borderRadius: 2,
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transform: 'translateY(-1px)',
                },
                opacity: isDragging ? 0.4 : 1,
                cursor: isDragging ? 'grabbing' : 'pointer',

                ...(isDropTarget && !isDragging && {
                    borderTop: '3px solid #3b82f6',
                    mt: '-2px',
                }),
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" alignItems="center" justifyContent="flex-end" mb={0.5}>
                    <Box display="flex" gap={1}>
                        {task.priority && (
                            <Chip
                                label={PRIORITY_CONFIG[task.priority].label}
                                size="small"
                                sx={{
                                    bgcolor: '#ffffff',
                                    color: PRIORITY_CONFIG[task.priority].color,
                                    border: `1px solid ${PRIORITY_CONFIG[task.priority].color}40`,
                                    fontWeight: 700,
                                    fontSize: 10,
                                    height: 20,
                                    textTransform: 'capitalize',
                                }}
                            />
                        )}
                    </Box>
                </Box>
                <Typography fontWeight={600} fontSize={14} mb={0.5} lineHeight={1.3}>
                    {task.title}
                </Typography>
                <Typography
                    fontSize={12}
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {task.description}
                </Typography>
            </CardContent>
        </Card>
    );
}