import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getColumns, updateColumn } from '@/api/columns';
import { ColumnData } from '@/types/task';

export const columnKeys = {
    all: ['columns'] as const,
};

export const useColumns = () => {
    return useQuery({
        queryKey: columnKeys.all,
        queryFn: getColumns,
    });
};

export const useUpdateColumn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<ColumnData> }) =>
            updateColumn(id, updates),
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: columnKeys.all });
            const previousColumns = queryClient.getQueryData<ColumnData[]>(columnKeys.all);

            if (previousColumns) {
                queryClient.setQueryData<ColumnData[]>(
                    columnKeys.all,
                    previousColumns.map(col => col.id === id ? { ...col, ...updates } : col)
                );
            }

            return { previousColumns };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousColumns) {
                queryClient.setQueryData(columnKeys.all, context.previousColumns);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: columnKeys.all });
        },
    });
};
