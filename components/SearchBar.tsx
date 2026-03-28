"use client";

import { InputBase, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTaskStore } from '@/store/useTaskStore';
import { useCallback, useState } from 'react';

function useDebounce(fn: (val: string) => void, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return useCallback((val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(val), delay);
    }, []);
}

export default function SearchBar() {
    const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
    const [inputValue, setInputValue] = useState('');

    const debouncedSearch = useDebounce(setSearchQuery, 400);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        debouncedSearch(e.target.value);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: { xs: '100%', sm: 320 },
                minWidth: { xs: '100%', sm: 280 },
                bgcolor: '#ffffff',
                borderRadius: '12px',
                px: 2,
                py: 0.75,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                '&:focus-within': {
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.12)',
                    borderColor: '#6366f1',
                    transform: 'translateY(-1px)',
                },
            }}
        >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
            <InputBase
                placeholder="Search tasks..."
                value={inputValue}
                onChange={handleChange}
                sx={{
                    ml: 1.5,
                    flex: 1,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#334155',
                    '& input::placeholder': {
                        color: '#94a3b8',
                        opacity: 1,
                    },
                }}
            />
        </Box>
    );
}