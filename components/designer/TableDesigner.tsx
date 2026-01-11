import React, { useState, useEffect } from 'react';
import {
   Database, FileText, Download, Upload, Info, Search, Save, Zap
} from 'lucide-react';
import TableDataView from './table/TableDataView';
import TableStructureView from './table/TableStructureView';
import { ColumnDefinition, SortConfig, Filters } from './table/types';

interface TableDesignerProps {
   file: any;
   readOnly?: boolean;
}

type ViewMode = 'data' | 'structure' | 'gen_crud';

const TableDesigner: React.FC<TableDesignerProps> = ({ file, readOnly = false }) => {
   const [viewMode, setViewMode] = useState<ViewMode>('data');
   const [searchQuery, setSearchQuery] = useState('');
   const [showDDL, setShowDDL] = useState(false);

   // Mock Data State
   const [columns, setColumns] = useState<ColumnDefinition[]>([
      { id: 'c1', name: 'id', label: 'ID', type: 'BIGINT', length: '', pk: true, nn: true, ai: true, default: '', comment: '', required: false, showInTable: true, showInForm: false, showInDetail: true, queryType: 'eq', componentType: 'Input', componentProps: '{}' },
      { id: 'c2', name: 'name', label: 'Name', type: 'VARCHAR', length: '100', pk: false, nn: true, ai: false, default: '', comment: 'User full name', required: true, showInTable: true, showInForm: true, showInDetail: true, queryType: 'like', componentType: 'Input', componentProps: '{"placeholder": "Enter full name"}' },
      { id: 'c3', name: 'email', label: 'Email', type: 'VARCHAR', length: '100', pk: false, nn: false, ai: false, default: '', comment: '', required: true, showInTable: true, showInForm: true, showInDetail: true, queryType: 'like', componentType: 'Input', componentProps: '{"type": "email"}' },
      { id: 'c4', name: 'status', label: 'Status', type: 'TINYINT', length: '1', pk: false, nn: true, ai: false, default: '1', comment: '0:Inactive 1:Active', required: true, showInTable: true, showInForm: true, showInDetail: true, queryType: 'eq', componentType: 'Select', componentProps: '{"options": [{"label": "Active", "value": 1}, {"label": "Inactive", "value": 0}]}' },
      { id: 'c5', name: 'created_at', label: 'Created At', type: 'DATETIME', length: '', pk: false, nn: true, ai: false, default: 'CURRENT_TIMESTAMP', comment: '', required: false, showInTable: true, showInForm: false, showInDetail: true, queryType: 'between', componentType: 'DateTimePicker', componentProps: '{}' },
      { id: 'c6', name: 'updated_at', label: 'Updated At', type: 'DATETIME', length: '', pk: false, nn: false, ai: false, default: '', comment: '', required: false, showInTable: false, showInForm: false, showInDetail: true, queryType: 'none', componentType: 'DateTimePicker', componentProps: '{}' },
   ]);

   const [rows, setRows] = useState<any[]>([]);
   const [tableMetadata, setTableMetadata] = useState({
      name: file.name || file.title || 'table_name',
      comment: 'Sample table comment',
      charset: 'utf8mb4',
      engine: 'InnoDB',
      autoIncrement: 1
   });

   const [showInfoModal, setShowInfoModal] = useState(false);
   const [showExportModal, setShowExportModal] = useState(false);
   const [showImportModal, setShowImportModal] = useState(false);

   // Sorting & Filtering State
   const [sortConfig, setSortConfig] = useState<SortConfig>(null);
   const [filters, setFilters] = useState<Filters>({});

   // Generation Modal State
   const [showGenerateModal, setShowGenerateModal] = useState(false);
   const [genPath, setGenPath] = useState('/src/pages');
   const [genFilename, setGenFilename] = useState('index.tsx');

   useEffect(() => {
      // Generate 20 mock rows
      const newRows = Array.from({ length: 25 }).map((_, i) => ({
         id: i + 1,
         name: `User ${i + 1}`,
         email: `user${i + 1}@example.com`,
         status: i % 2,
         created_at: '2023-01-01 12:00:00',
         updated_at: '2023-01-02 12:00:00'
      }));
      setRows(newRows);
   }, [file.id]);

   const handleSave = () => {
      // Logic handles both Save Structure and Gen CRUD based on viewMode or context
      // For this simplified version, this function might just be for 'Structure Save'
      const payload = {
         tableMetadata,
         columns
      };
      console.log("Saving Table Structure:", payload);
      alert("Table Structure Saved!\n" + JSON.stringify(payload, null, 2));
   };

   return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-sm relative">
         {/* 1. Header & Toolbar */}
         <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col shadow-sm z-20">

            {/* Top Row: Title & Info */}
            <div className="h-10 px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-2">
                  <Database size={16} className="text-amber-500" />
                  <span className="font-bold text-gray-700 dark:text-gray-200 text-base">{tableMetadata.name}</span>
                  <span className="text-xs text-gray-400 ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{tableMetadata.engine}</span>
                  <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{tableMetadata.charset}</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                     <button
                        onClick={() => setViewMode('data')}
                        className={`px-3 py-1 rounded transition-all ${viewMode === 'data' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        Data
                     </button>
                     <button
                        onClick={() => setViewMode('structure')}
                        className={`px-3 py-1 rounded transition-all ${viewMode === 'structure' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        Structure
                     </button>
                     <button
                        onClick={() => setViewMode('gen_crud')}
                        className={`px-3 py-1 rounded transition-all ${viewMode === 'gen_crud' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-white font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                        Gen CRUD
                     </button>
                  </div>
               </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="h-10 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">

               {/* Left Actions */}
               <div className="flex items-center gap-1">
                  <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs transition-colors" title="Table Info">
                     <Info size={14} /> <span className="hidden sm:inline">Info</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  <button onClick={() => setShowDDL(true)} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs transition-colors" title="View DDL">
                     <FileText size={14} /> <span className="hidden sm:inline">DDL</span>
                  </button>
                  <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs transition-colors" title="Export Data">
                     <Download size={14} /> <span className="hidden sm:inline">Export</span>
                  </button>
                  <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs transition-colors" title="Import Data">
                     <Upload size={14} /> <span className="hidden sm:inline">Import</span>
                  </button>

                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
               </div>

               {/* Right: Quick Query */}
               <div className="flex items-center gap-2">
                  <div className="relative">
                     <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Quick Query (highlight matches)"
                        className="w-48 pl-7 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:border-nebula-500 transition-all focus:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  {viewMode === 'structure' && !readOnly && (
                     <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs shadow-sm">
                        <Save size={13} /> Save
                     </button>
                  )}
                  {viewMode === 'gen_crud' && (
                     <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 text-white bg-nebula-600 hover:bg-nebula-700 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-md">
                        <Zap size={14} />
                        Generate Page
                     </button>
                  )}
               </div>
            </div>
         </div>

         {/* 2. Main Content Area */}
         <div className="flex-1 overflow-hidden relative">
            {viewMode === 'data' ? (
               <TableDataView
                  columns={columns}
                  rows={rows}
                  searchQuery={searchQuery}
                  sortConfig={sortConfig}
                  filters={filters}
                  onSortChange={setSortConfig}
                  onFilterChange={setFilters}
               />
            ) : (
               <TableStructureView
                  columns={columns}
                  setColumns={setColumns}
                  readOnly={readOnly}
                  viewMode={viewMode}
                  onSave={() => setShowGenerateModal(true)}
               />
            )}
         </div>

         {/* Modals */}

         {/* Info Modal */}
         {showInfoModal && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Table Information</h3>
                  <div className="space-y-3">
                     <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                        <span className="text-gray-500">Name</span>
                        <span className="font-mono font-medium dark:text-gray-300">{tableMetadata.name}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                        <span className="text-gray-500">Engine</span>
                        <span className="font-mono font-medium dark:text-gray-300">{tableMetadata.engine}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                        <span className="text-gray-500">Charset</span>
                        <span className="font-mono font-medium dark:text-gray-300">{tableMetadata.charset}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                        <span className="text-gray-500">Row Count</span>
                        <span className="font-mono font-medium dark:text-gray-300">{rows.length}</span>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                     <button onClick={() => setShowInfoModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">Close</button>
                  </div>
               </div>
            </div>
         )}

         {/* Generate Page Modal */}
         {showGenerateModal && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden">
                  <div className="bg-nebula-600 p-6 text-white text-center">
                     <Zap size={40} className="mx-auto mb-2 opacity-50" />
                     <h3 className="text-xl font-bold">Generate Feature Page</h3>
                     <p className="text-nebula-100 text-sm mt-1">Configure output settings</p>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Directory</label>
                        <input
                           type="text"
                           value={genPath}
                           onChange={(e) => setGenPath(e.target.value)}
                           className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-nebula-500/20 focus:border-nebula-500 font-mono text-sm"
                           placeholder="/src/pages/..."
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filename</label>
                        <input
                           type="text"
                           value={genFilename}
                           onChange={(e) => setGenFilename(e.target.value)}
                           className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-nebula-500/20 focus:border-nebula-500 font-mono text-sm"
                           placeholder="index.tsx"
                        />
                     </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2">
                     <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                     <button
                        onClick={() => {
                           const payload = {
                              ...tableMetadata,
                              columns,
                              generation: {
                                 path: genPath,
                                 filename: genFilename
                              }
                           };
                           console.log("Submitting Generation Task:", payload);
                           alert(JSON.stringify(payload, null, 2));
                           setShowGenerateModal(false);
                        }}
                        className="px-6 py-2 bg-nebula-600 text-white rounded font-medium hover:bg-nebula-700 transition-colors flex items-center gap-2"
                     >
                        <Zap size={14} /> Generate
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TableDesigner;
