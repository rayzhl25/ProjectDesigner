import React, { useState, useEffect, useRef } from 'react';
import { Play, Save, History, Eraser, Table as TableIcon, Braces, Search, ChevronLeft, ChevronRight as ChevronRightIcon, X } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { FileSystemItem, ThemeMode } from '../../../types';

interface QueryEditorProps {
    file: FileSystemItem;
    theme?: ThemeMode;
}

interface QueryResult {
    columns: string[];
    rows: any[];
    executionTime: number;
    rowCount: number;
}

interface HistoryItem {
    id: string;
    sql: string;
    timestamp: Date;
    status: 'success' | 'error';
    duration: number;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ file, theme = 'dark' }) => {
    // Determine effective theme for Monaco
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const monacoTheme = isDark ? 'vs-dark' : 'light';

    const [sql, setSql] = useState('select * from demo_table limit 10;');
    const [activeTab, setActiveTab] = useState<'results' | 'messages' | 'history'>('results');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<QueryResult | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    // History
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Filter & Pagination
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleSave = () => {
        // Mock Backend API Call
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-xs animate-fade-in-up';
        toast.textContent = '保存成功';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    const handleRun = () => {
        setIsExecuting(true);
        setActiveTab('results');
        setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing query...`]);

        // Mock Backend Execution
        setTimeout(() => {
            const mockColumns = ['id', 'name', 'status', 'created_at', 'details'];
            const mockRows = Array.from({ length: 45 }, (_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
                status: i % 3 === 0 ? 'Active' : 'Inactive',
                created_at: new Date().toISOString(),
                details: `Details for item ${i + 1}`
            }));

            const executionTime = Math.floor(Math.random() * 500) + 50;
            const newResult = {
                columns: mockColumns,
                rows: mockRows,
                executionTime,
                rowCount: mockRows.length
            };

            setResult(newResult);
            setIsExecuting(false);
            setMessages(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] Query executed in ${executionTime}ms. ${newResult.rowCount} rows affected.`
            ]);

            // Add to History
            const newHistoryItem: HistoryItem = {
                id: Date.now().toString(),
                sql: sql,
                timestamp: new Date(),
                status: 'success',
                duration: executionTime
            };
            setHistory(prev => [newHistoryItem, ...prev]);

        }, 800);
    };

    const handleClear = () => {
        setSql('');
    };

    const handleFormat = () => {
        // Simple Mock Formatter
        const formatted = sql.replace(/\s+/g, ' ').replace(/\s+(select|from|where|order by|limit|join|left join|right join|group by|having)\s+/gi, '\n$1 ').trim();
        setSql(formatted);
    };

    // Filter Logic
    const filteredRows = result?.rows.filter(row => {
        if (!filterText) return true;
        return Object.values(row).some(val =>
            String(val).toLowerCase().includes(filterText.toLowerCase())
        );
    }) || [];

    // Pagination Logic
    const totalPages = Math.ceil(filteredRows.length / pageSize);
    const pageRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Highlight Function
    const renderCell = (value: any) => {
        const text = String(value);
        if (!filterText) return text;
        const parts = text.split(new RegExp(`(${filterText})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === filterText.toLowerCase() ?
                <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-yellow-100 font-bold">{part}</span> : part
        );
    };

    return (
        <div className="flex h-full w-full relative overflow-hidden">
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300 font-sans min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-10 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={handleRun} disabled={isExecuting} className={`flex items-center gap-1 px-3 py-1 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-green-600 dark:text-green-500 rounded text-xs font-medium transition-colors ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Play size={14} fill="currentColor" /> {isExecuting ? 'Running...' : ''}
                        </button>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button onClick={handleSave} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" title="Save">
                            <Save size={14} />
                        </button>
                        <button onClick={handleClear} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" title="Clear">
                            <Eraser size={14} />
                        </button>
                        <button onClick={handleFormat} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" title="Format SQL">
                            <Braces size={14} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400 ${showHistory ? 'bg-gray-200 dark:bg-gray-700 text-nebula-600 dark:text-white' : ''}`}
                            title="History"
                        >
                            <History size={14} />
                        </button>
                    </div>
                </div>

                {/* SQL Editor Area */}
                <div className="flex-1 min-h-0 relative">
                    <MonacoEditor
                        height="100%"
                        language="sql"
                        theme={monacoTheme}
                        value={sql}
                        onChange={(val) => setSql(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
                        }}
                    />
                </div>

                {/* Resizer Handle */}
                <div className="h-1 bg-gray-200 dark:bg-gray-800 hover:bg-nebula-500 cursor-ns-resize transition-colors"></div>

                {/* Results Pane */}
                <div className="h-[40%] flex flex-col bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    {/* Result Tabs */}
                    <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`px-4 py-1.5 text-xs font-medium flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 ${activeTab === 'results' ? 'bg-white dark:bg-gray-700 text-nebula-600 dark:text-white border-b-2 border-b-nebula-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            onClick={() => setActiveTab('results')}
                        >
                            <TableIcon size={12} /> 结果
                        </button>
                        <button
                            className={`px-4 py-1.5 text-xs font-medium flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 ${activeTab === 'messages' ? 'bg-white dark:bg-gray-700 text-nebula-600 dark:text-white border-b-2 border-b-nebula-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            消息
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'results' ? (
                            <>
                                {/* Table Toolbar & Filter */}
                                <div className="flex items-center justify-between px-2 py-1 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="relative flex items-center">
                                            <Search size={12} className="absolute left-2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="快速查询..."
                                                value={filterText}
                                                onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
                                                className="pl-6 pr-2 py-1 w-48 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-nebula-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                            >
                                                <ChevronLeft size={12} />
                                            </button>
                                            <span className="min-w-[40px] text-center">
                                                {currentPage} / {totalPages || 1}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage >= totalPages}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                            >
                                                <ChevronRightIcon size={12} />
                                            </button>
                                        </div>
                                        <div>
                                            共 {filteredRows.length} 条
                                        </div>
                                    </div>
                                </div>

                                {/* Data Grid */}
                                <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 relative">
                                    {!result ? (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                            请点击运行以查看结果
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse text-xs text-gray-600 dark:text-gray-300">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                    <th className="p-2 border-r border-gray-200 dark:border-gray-700 border-b font-medium w-10 text-center text-gray-500">#</th>
                                                    {result.columns.map(col => (
                                                        <th key={col} className="p-2 border-r border-gray-200 dark:border-gray-700 border-b font-medium whitespace-nowrap">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageRows.map((row, i) => (
                                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="p-2 border-r border-gray-100 dark:border-gray-800 text-center text-gray-500">
                                                            {(currentPage - 1) * pageSize + i + 1}
                                                        </td>
                                                        {result.columns.map(col => (
                                                            <td key={col} className="p-2 border-r border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                                                {renderCell(row[col])}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                                {pageRows.length === 0 && (
                                                    <tr>
                                                        <td colSpan={result.columns.length + 1} className="p-4 text-center text-gray-400">
                                                            暂无匹配数据
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 overflow-auto p-4 bg-gray-900 font-mono text-xs">
                                {messages.map((msg, i) => (
                                    <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0 text-gray-300">
                                        <span className="text-green-500 text-xs font-bold mr-2">{'>'}</span>{msg}
                                    </div>
                                ))}
                                {messages.length === 0 && <div className="text-gray-600 italic">暂无日志</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History Sidebar */}
            {showHistory && (
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col border-r-0">
                    <div className="h-10 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>History</span>
                        <button onClick={() => setShowHistory(false)} className="hover:text-gray-700 dark:hover:text-gray-300">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {history.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-xs">暂无历史记录</div>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group"
                                    onClick={() => setSql(item.sql)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] px-1.5 rounded ${item.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                            {item.status === 'success' ? 'SUCCESS' : 'ERROR'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-xs font-mono text-gray-600 dark:text-gray-300 line-clamp-2" title={item.sql}>
                                        {item.sql}
                                    </div>
                                    <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between">
                                        <span>{item.duration}ms</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueryEditor;
