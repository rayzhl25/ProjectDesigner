
import React from 'react';
import { Play, Save, Settings, Plus, Trash2, Code2, Copy } from 'lucide-react';

interface BackendDesignerProps {
  file: any;
}

const BackendDesigner: React.FC<BackendDesignerProps> = ({ file }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
      {/* Toolbar */}
      <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">GET</span>
            <span className="font-mono text-gray-600 dark:text-gray-300">/api/v1/{file.title}</span>
         </div>
         <div className="flex items-center gap-2">
           <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
              <Play size={14} /> Test
           </button>
           <button className="flex items-center gap-1 px-3 py-1 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs">
              <Save size={14} /> Save
           </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Request Config */}
         <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
               <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Request Parameters</h3>
               <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                     <tr>
                        <th className="p-2">Key</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Required</th>
                        <th className="p-2">Description</th>
                        <th className="p-2 w-8"></th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="p-2"><input type="text" className="w-full bg-transparent outline-none" placeholder="id" /></td>
                        <td className="p-2"><span className="text-blue-600">Integer</span></td>
                        <td className="p-2"><input type="checkbox" checked /></td>
                        <td className="p-2 text-gray-400">User ID</td>
                        <td className="p-2 text-red-500 cursor-pointer"><Trash2 size={14} /></td>
                     </tr>
                     <tr>
                        <td className="p-2" colSpan={5}>
                           <button className="flex items-center gap-1 text-nebula-600 hover:underline"><Plus size={14} /> Add Parameter</button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
            
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
               <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Code2 size={16} /> Logic Flow
               </h3>
               <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                     <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">Validate Input</div>
                     </div>
                     <Settings size={14} className="text-gray-400 cursor-pointer" />
                  </div>
                  <div className="flex justify-center"><div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div></div>
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">2</div>
                     <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">Query Database (User)</div>
                        <div className="text-xs text-gray-500">SELECT * FROM users WHERE id = :id</div>
                     </div>
                     <Settings size={14} className="text-gray-400 cursor-pointer" />
                  </div>
                  <div className="flex justify-center"><div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div></div>
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm flex items-center gap-3 border-green-200 bg-green-50">
                     <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">3</div>
                     <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">Return Response</div>
                     </div>
                  </div>
                  
                  <button className="w-full border border-dashed border-gray-300 dark:border-gray-600 p-2 rounded text-gray-400 hover:text-nebula-600 hover:border-nebula-400 transition-colors flex items-center justify-center gap-2">
                     <Plus size={16} /> Add Step
                  </button>
               </div>
            </div>
         </div>

         {/* Response Preview */}
         <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-200">Response Schema</div>
            <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-300">
               <pre>{`{
  "code": 200,
  "data": {
    "id": 1,
    "name": "Admin",
    "role": "admin"
  },
  "msg": "Success"
}`}</pre>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BackendDesigner;
