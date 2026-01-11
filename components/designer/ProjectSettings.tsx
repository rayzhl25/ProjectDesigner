
import React from 'react';
import { Save, Settings, Info } from 'lucide-react';

const ProjectSettings = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm">
      <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
         <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-500" />
            <span className="font-bold text-gray-700 dark:text-gray-200">Project Configuration</span>
         </div>
         <button className="flex items-center gap-1 px-3 py-1.5 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs font-medium">
            <Save size={14} /> Save Changes
         </button>
      </div>
      <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2">
                <Info size={20} className="text-nebula-500" /> General Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                  <input type="text" defaultValue="My Awesome Project" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-colors" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                  <input type="text" defaultValue="1.0.0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-colors" />
               </div>
               <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-nebula-500 outline-none transition-colors resize-none" defaultValue="Enterprise resource planning system for internal use."></textarea>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 mt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">Environment Variables</h3>
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input type="text" placeholder="KEY" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-sm" />
                    <input type="text" placeholder="VALUE" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-sm" />
                    <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500">+</button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
