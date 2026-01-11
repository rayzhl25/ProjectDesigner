import React, { useState } from 'react';
import { Key, MoreHorizontal, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ColumnDefinition, SortConfig, Filters } from './types';

interface TableDataViewProps {
    columns: ColumnDefinition[];
    rows: any[];
    searchQuery: string;
    sortConfig: SortConfig;
    filters: Filters;
    onSortChange: (sort: SortConfig) => void;
    onFilterChange: (filters: Filters) => void;
}

const TableDataView: React.FC<TableDataViewProps> = ({
    columns,
    rows,
    searchQuery,
    sortConfig,
    filters,
    onSortChange,
    onFilterChange,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilterInputs, setShowFilterInputs] = useState(false);
    const itemsPerPage = 10;

    // Logic moved from parent
    const filteredRows = rows.filter(row => {
        // 1. Global Search
        if (searchQuery && !Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
        }
        // 2. Column Filters
        for (const key in filters) {
            if (filters[key] && !String(row[key] || '').toLowerCase().includes(filters[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getHighlightedText = (text: string, highlight: string) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 dark:bg-yellow-900 text-black dark:text-white rounded px-0.5 font-medium">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="flex-1 overflow-auto flex flex-col">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 uppercase font-medium sticky top-0 bg-opacity-100 z-10">
                        <tr>
                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-10 text-center">
                                <button onClick={() => setShowFilterInputs(!showFilterInputs)} className={`hover:text-nebula-500 ${showFilterInputs ? 'text-nebula-500' : ''}`}>
                                    <Filter size={12} />
                                </button>
                            </th>
                            {columns.map(col => (
                                <th
                                    key={col.name}
                                    className="p-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        if (sortConfig?.key === col.name) {
                                            if (sortConfig.direction === 'asc') onSortChange({ key: col.name, direction: 'desc' });
                                            else onSortChange(null);
                                        } else {
                                            onSortChange({ key: col.name, direction: 'asc' });
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.pk && <Key size={10} className="text-yellow-500" />}
                                        {col.name}
                                        <div className="ml-auto">
                                            {sortConfig?.key === col.name ? (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-nebula-500" /> : <ArrowDown size={12} className="text-nebula-500" />
                                            ) : (
                                                <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-30" />
                                            )}
                                        </div>
                                    </div>
                                </th>
                            ))}
                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                        </tr>
                        {/* Filter Row */}
                        {showFilterInputs && (
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <td className="p-2 border-b border-gray-200 dark:border-gray-700"></td>
                                {columns.map(col => (
                                    <td key={col.id} className="p-2 border-b border-gray-200 dark:border-gray-700">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:border-nebula-500"
                                            placeholder={`Filter...`}
                                            value={filters[col.name] || ''}
                                            onChange={(e) => onFilterChange({ ...filters, [col.name]: e.target.value })}
                                            onClick={(e) => e.stopPropagation()} // Prevent sort trigger
                                        />
                                    </td>
                                ))}
                                <td className="p-2 border-b border-gray-200 dark:border-gray-700"></td>
                            </tr>
                        )}
                    </thead>
                    <tbody className="text-sm text-gray-700 dark:text-gray-200 divide-y divide-gray-100 dark:divide-gray-700">
                        {paginatedRows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-3 text-center text-gray-400 text-xs">{row.id}</td>
                                {columns.map(col => (
                                    <td key={col.id} className="p-3 whitespace-nowrap max-w-[200px] truncate">
                                        {searchQuery ? getHighlightedText(row[col.name], searchQuery) : row[col.name]}
                                    </td>
                                ))}
                                <td className="p-3 text-center">
                                    <MoreHorizontal size={14} className="cursor-pointer text-gray-400 hover:text-gray-600" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length} rows</span>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Previous
                    </button>
                    <span className="flex items-center">Page {currentPage} of {totalPages || 1}</span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableDataView;
