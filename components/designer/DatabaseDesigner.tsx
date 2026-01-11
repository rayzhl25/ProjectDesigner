
import React from 'react';
import { Plus, Save, Table as TableIcon, Key, MoreHorizontal, Database } from 'lucide-react';

interface DatabaseDesignerProps {
  file: any;
}

const DatabaseDesigner: React.FC<DatabaseDesignerProps> = ({ file }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
       {/* Toolbar */}
       <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <Database size={16} className="text-amber-500" />
            <span className="font-bold text-gray-700 dark:text-gray-200">{file.title}</span>
            <span className="text-xs text-gray-400 ml-2">InnoDB • utf8mb4</span>
         </div>
         <div className="flex items-center gap-2">
           <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs">
              <Save size={14} /> Update Schema
           </button>
         </div>
      </div>

      <div className="p-6 overflow-auto flex-1">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-4xl mx-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 uppercase font-medium">
                  <tr>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700">Column Name</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700">Type</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700">Length</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">PK</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-center">NN</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700">Default</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700">Comment</th>
                     <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                  </tr>
               </thead>
               <tbody className="text-sm text-gray-700 dark:text-gray-200">
                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                     <td className="p-3 text-center text-gray-400"><Key size={12} className="text-yellow-500 inline" /></td>
                     <td className="p-3 font-medium">id</td>
                     <td className="p-3">BIGINT</td>
                     <td className="p-3">20</td>
                     <td className="p-3 text-center"><input type="checkbox" checked readOnly /></td>
                     <td className="p-3 text-center"><input type="checkbox" checked readOnly /></td>
                     <td className="p-3 text-gray-400">AUTO_INCREMENT</td>
                     <td className="p-3">Primary Key</td>
                     <td className="p-3"><MoreHorizontal size={14} className="cursor-pointer text-gray-400" /></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                     <td className="p-3 text-center text-gray-400"></td>
                     <td className="p-3 font-medium">username</td>
                     <td className="p-3">VARCHAR</td>
                     <td className="p-3">50</td>
                     <td className="p-3 text-center"><input type="checkbox" /></td>
                     <td className="p-3 text-center"><input type="checkbox" checked readOnly /></td>
                     <td className="p-3"></td>
                     <td className="p-3">Login Name</td>
                     <td className="p-3"><MoreHorizontal size={14} className="cursor-pointer text-gray-400" /></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                     <td className="p-3 text-center text-gray-400"></td>
                     <td className="p-3 font-medium">status</td>
                     <td className="p-3">TINYINT</td>
                     <td className="p-3">1</td>
                     <td className="p-3 text-center"><input type="checkbox" /></td>
                     <td className="p-3 text-center"><input type="checkbox" /></td>
                     <td className="p-3">1</td>
                     <td className="p-3">1:Active 0:Inactive</td>
                     <td className="p-3"><MoreHorizontal size={14} className="cursor-pointer text-gray-400" /></td>
                  </tr>
               </tbody>
            </table>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
               <button className="flex items-center gap-1 text-nebula-600 hover:underline text-xs font-bold uppercase tracking-wide">
                  <Plus size={14} /> Add Column
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DatabaseDesigner;
