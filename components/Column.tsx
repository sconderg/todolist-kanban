"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, CircularProgress,
    Alert, Button, IconButton, Menu, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ColumnData } from '@/types/task';
import { useColumnTasks, useCreateTask } from '@/hooks/useTasks';
import { useUpdateColumn } from '@/hooks/useColumns';
import { useTaskStore } from '@/store/useTaskStore';
import { useDroppable } from '@dnd-kit/react';
import TaskCard from './TaskCard';
import NewTaskInline from './NewTaskInline';
import { COLUMN_COLOR_PRESETS } from '@/constants/board';

interface ColumnProps {
    column: ColumnData;
}

export default function Column({ column }: ColumnProps) {
    const { id, label, color } = column;
    const { mutate: updateColumn } = useUpdateColumn();
    const { mutate: createTask } = useCreateTask();
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const [inlineCreatePos, setInlineCreatePos] = useState<'top' | 'bottom' | null>(null);

    const searchQuery = useTaskStore((s) => s.searchQuery);
    const openModal = useTaskStore((s) => s.openModal);

    const { ref: droppableRef } = useDroppable({
        id: id,
        // @ts-ignore
        data: { type: 'column', column: id }
    });
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useColumnTasks(id, searchQuery);

    const tasks = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.total ?? 0;

    const handleInlineSave = (title: string, pos: 'top' | 'bottom') => {
        let newOrder: number = Date.now();
        if (tasks.length > 0) {
            newOrder = pos === 'top' ? tasks[0].order / 2 : tasks[tasks.length - 1].order + 1000;
        }

        createTask({
            title,
            column: id,
            order: newOrder,
            description: '',
        });
        setInlineCreatePos(null);
    };

    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <Paper
            ref={droppableRef}
            elevation={0}
            sx={{
                width: 280,
                minWidth: 280,
                bgcolor: `${color}0D`,
                border: `1px solid ${color}33`,
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                overflowY: 'auto',
            }}
        >
            <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                mb={1} 
                sx={{ '&:hover .header-action-btn': { opacity: 1 } }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', minWidth: 10, bgcolor: color }} />
                    <Typography fontWeight={700} fontSize={13} textTransform="uppercase" letterSpacing={1}>
                        {label}
                    </Typography>
                    <Typography
                        fontSize={12}
                        sx={{ bgcolor: '#e2e8f0', px: 1, py: 0.25, borderRadius: 10, color: 'text.secondary' }}
                    >
                        {total}
                    </Typography>
                </Box>
                
                <Box display="flex" gap={0.5}>
                    <IconButton 
                        className="header-action-btn"
                        size="small" 
                        onClick={() => setInlineCreatePos('top')}
                        sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.5 }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        className="header-action-btn"
                        size="small" 
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.5 }}
                    >
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ p: 1.5, width: 150 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: 'block' }}>
                        COLUMN COLOR
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {COLUMN_COLOR_PRESETS.map((preset) => (
                            <Box
                                key={preset.label}
                                onClick={() => {
                                    updateColumn({ id, updates: { color: preset.value } });
                                    setAnchorEl(null);
                                }}
                                title={preset.label}
                                sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: preset.value,
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    border: color === preset.value ? '2px solid #0f172a' : '2px solid transparent',
                                    '&:hover': { transform: 'scale(1.15)', transition: 'transform 0.1s' }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Menu>

            {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', mt: 2 }} />}
            {isError && <Alert severity="error">Failed to load tasks</Alert>}
            
            {inlineCreatePos === 'top' && (
                <NewTaskInline 
                    columnColor={color} 
                    onSave={(title) => handleInlineSave(title, 'top')} 
                    onCancel={() => setInlineCreatePos(null)} 
                />
            )}

            {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} columnColor={color} />
            ))}

            {inlineCreatePos === 'bottom' && (
                <NewTaskInline 
                    columnColor={color} 
                    onSave={(title) => handleInlineSave(title, 'bottom')} 
                    onCancel={() => setInlineCreatePos(null)} 
                />
            )}

            {!isLoading && !isError && (
                <Button
                    onClick={() => setInlineCreatePos('bottom')}
                    startIcon={<AddIcon />}
                    disableElevation
                    sx={{
                        mt: 1,
                        bgcolor: 'transparent',
                        border: '1px dashed #cbd5e1',
                        color: '#64748b',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: '#f1f5f9',
                            borderColor: '#94a3b8',
                        }
                    }}
                >
                    Add Task
                </Button>
            )}

            {hasNextPage && <Box ref={observerTarget} sx={{ height: 1, minHeight: 1 }} />}

            {isFetchingNextPage && <CircularProgress size={24} sx={{ alignSelf: 'center', mt: 2, mb: 1 }} />}
        </Paper>
    );
}