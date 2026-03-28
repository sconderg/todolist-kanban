import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, CardContent, InputBase } from '@mui/material';

interface NewTaskInlineProps {
    columnColor: string;
    onSave: (title: string) => void;
    onCancel: () => void;
}

export default function NewTaskInline({ columnColor, onSave, onCancel }: NewTaskInlineProps) {
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (title.trim()) {
                onSave(title.trim());
            } else {
                onCancel();
            }
        }
        if (e.key === 'Escape') {
            onCancel();
            e.preventDefault();
        }
    };

    const handleBlur = () => {
        if (title.trim()) {
            onSave(title.trim());
        } else {
            onCancel();
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                bgcolor: `${columnColor}50`,
                border: `1px solid ${columnColor}40`,
                borderRadius: 2,
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <InputBase
                    inputRef={inputRef}
                    fullWidth
                    placeholder="Type a name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        lineHeight: 1.3,
                        p: 0,
                    }}
                />
            </CardContent>
        </Card>
    );
}
