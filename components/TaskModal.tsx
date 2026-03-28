"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Menu,
    IconButton,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Column, Priority } from '@/types/task';
import { BOARD_COLUMNS, BOARD_COLUMN_IDS, PRIORITY_CONFIG, PRIORITY_OPTIONS } from '@/constants/board';

export default function TaskModal() {
    const { isModalOpen, editingTask, defaultColumn, closeModal } = useTaskStore();
    const { mutate: createTask, isPending: isCreating } = useCreateTask();
    const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
    const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [column, setColumn] = useState<Column>('backlog');
    const [priority, setPriority] = useState<Priority | ''>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isEditMode = !!editingTask;
    const isPending = isCreating || isUpdating || isDeleting;
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        if (editingTask && confirm(`Delete "${editingTask.title}"?`)) {
            deleteTask(editingTask.id, { onSuccess: closeModal });
        }
        handleMenuClose();
    };

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description);
            setColumn(editingTask.column);
            setPriority(editingTask.priority || '');
        } else {
            setTitle('');
            setDescription('');
            setColumn(defaultColumn || 'backlog');
            setPriority('');
        }
    }, [editingTask, defaultColumn]);

    const handleSubmit = () => {
        if (!title.trim()) return;

        if (isEditMode) {
            updateTask(
                { id: editingTask.id, updates: { title, description, column, priority: priority || undefined } },
                { onSuccess: closeModal }
            );
        } else {
            createTask(
                { title, description, column, priority: priority || undefined },
                { onSuccess: closeModal }
            );
        }
    };

    return (
        <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
            <DialogTitle fontWeight={700} display="flex" justifyContent="space-between" alignItems="center">
                {isEditMode ? 'Edit Task' : 'New Task'}
                {isEditMode && (
                    <Box>
                        <IconButton size="small" onClick={handleMenuClick}>
                            <MoreHorizIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                Delete Task
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </DialogTitle>

            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                        autoFocus
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Column"
                        value={column}
                        onChange={(e) => setColumn(e.target.value as Column)}
                        fullWidth
                        select
                    >
                        {BOARD_COLUMN_IDS.map((col) => (
                            <MenuItem key={col} value={col}>
                                {BOARD_COLUMNS[col].label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Priority (Optional)"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority | '')}
                        fullWidth
                        select
                    >
                        <MenuItem value="">None</MenuItem>
                        {PRIORITY_OPTIONS.map((prio) => (
                            <MenuItem key={prio} value={prio}>
                                {PRIORITY_CONFIG[prio].label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={closeModal} disabled={isPending}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isPending || !title.trim()}
                >
                    {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}