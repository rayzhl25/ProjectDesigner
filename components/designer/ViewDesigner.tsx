import React, { useState } from 'react';
import { Save, Play, Table, Code, Database, Eye } from 'lucide-react';
import MonacoEditor from './editors/MonacoEditor';

interface ViewDesignerProps {
    file: any;
}

const ViewDesigner: React.FC<ViewDesignerProps> = ({ file }) => {
    const [activeTab, setActiveTab] = useState<'definition' | 'data'>('definition');
    const [sql, setSql] = useState(`CREATE VIEW \`${file.name || 'view_name'}\` AS\nSELECT \n  u.id,\n  u.name,\n  u.email,\n  p.role_name\nFROM sys_users u\nLEFT JOIN sys_roles p ON u.role_id = p.id\nWHERE u.status = 1;`);

    // Mock Data for View Result
    const [rows] = useState([
        { id: 1, name: 'User 1', email: 'user1@example.com', role_name: 'Admin' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role_name: 'Editor' },
        { id: 3, name: 'User 3', email: 'user3@example.com', role_name: 'Viewer' },
        { id: 4, name: 'User 4', email: 'user4@example.com', role_name: 'Viewer' },
        { id: 5, name: 'User 5', email: 'user5@example.com', role_name: 'Editor' },
    ]);
    const columns = ['id', 'name', 'email', 'role_name'];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <Eye size={16} className="text-purple-500" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">{file.name || 'New View'}</span>
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">VIEW</span>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded text-xs hover:bg-nebula-700 shadow-sm transition-all" onClick={() => alert("View Definition Saved!")}>
                        <Save size={14} /> Save
                    </button>
                </div>
            </div>

            {/* Toolbar/Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
                <button
                    onClick={() => setActiveTab('definition')}
                    className={`px-4 py-2 text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'definition' ? 'border-nebula-500 text-nebula-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Code size={14} /> Definition (SQL)
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'data' ? 'border-nebula-500 text-nebula-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Table size={14} /> Data Preview
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-gray-50/50 dark:bg-gray-900/50">
                {activeTab === 'definition' && (
                    <div className="absolute inset-0 p-0 flex flex-col">
                        <div className="flex-1 p-4">
                            <div className="w-full h-full relative rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
                                <MonacoEditor
                                    language="sql"
                                    value={sql}
                                    onChange={(val) => setSql(val || '')}
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Press Ctrl+Enter to execute</span>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 shadow-sm" onClick={() => setActiveTab('data')}>
                                <Play size={14} /> Execute & Preview
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="absolute inset-0 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {columns.map(col => (
                                        <th key={col} className="p-3 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900">
                                {rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        {columns.map(col => (
                                            <td key={col} className="p-3 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">{(row as any)[col]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewDesigner;
