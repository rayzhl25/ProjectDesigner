import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
   Search, X, Plus, ChevronDown, ChevronRight,
   Monitor, Smartphone, Server, Database, Globe
} from 'lucide-react';
import { FileSystemItem, Language } from '../../types';
import { LOCALE } from '../../constants';
import { WebExplorer } from './explorer/WebExplorer';
import { AppExplorer } from './explorer/AppExplorer';
import { BackendExplorer } from './explorer/BackendExplorer';
import { DatabaseExplorer } from './explorer/DatabaseExplorer';
import { ExternalExplorer } from './explorer/ExternalExplorer';

interface ProjectExplorerProps {
   isVisible: boolean;
   width: number;
   onResizeStart: () => void;
   activeFileId: string | null;
   lang: Language;

   // Data
   items: {
      pages: FileSystemItem[];
      apps: FileSystemItem[];
      apis: FileSystemItem[];
      models: FileSystemItem[];
      external: FileSystemItem[];
   };

   // Actions
   onOpenFile: (file: FileSystemItem) => void;
   onToggleFolder: (itemId: string) => void;
   onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
   onRootContextMenu: (e: React.MouseEvent, rootType: string) => void;
   onMoveNode: (draggedId: string, targetId: string, rootType: string) => void;
   onAddRootItem: (root: 'pages' | 'apps' | 'apis' | 'models' | 'external', isFolder: boolean) => void;
   className?: string; // Add className prop
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
   isVisible,
   width,
   onResizeStart,
   activeFileId,
   lang,
   items,
   onOpenFile,
   onToggleFolder,
   onContextMenu,
   onRootContextMenu,
   onMoveNode,
   onAddRootItem,
   className = ''
}) => {
   const t = LOCALE[lang];

   // Local State
   const [searchQuery, setSearchQuery] = useState('');
   const [isSearchActive, setIsSearchActive] = useState(false);
   const searchInputRef = useRef<HTMLInputElement>(null);

   const [sidebarExpanded, setSidebarExpanded] = useState({
      pages: true,
      apps: true,
      apis: true,
      models: true,
      external: true
   });

   const toggleSidebarGroup = (group: keyof typeof sidebarExpanded) => {
      setSidebarExpanded(prev => ({ ...prev, [group]: !prev[group] }));
   };

   useEffect(() => {
      if (isSearchActive && searchInputRef.current) {
         searchInputRef.current.focus();
      }
   }, [isSearchActive]);

   // Filtering Logic
   const filterTree = (nodes: FileSystemItem[], query: string): FileSystemItem[] => {
      if (!query) return nodes;
      return nodes.reduce<FileSystemItem[]>((acc, item) => {
         const matchesName = item.name.toLowerCase().includes(query.toLowerCase());
         if (item.children) {
            const filteredChildren = filterTree(item.children, query);
            if (matchesName || filteredChildren.length > 0) {
               acc.push({ ...item, children: filteredChildren, isOpen: true });
            }
         } else {
            if (matchesName) acc.push(item);
         }
         return acc;
      }, []);
   };

   const visiblePages = useMemo(() => filterTree(items.pages, searchQuery), [items.pages, searchQuery]);
   const visibleApps = useMemo(() => filterTree(items.apps, searchQuery), [items.apps, searchQuery]);
   const visibleApis = useMemo(() => filterTree(items.apis, searchQuery), [items.apis, searchQuery]);
   const visibleModels = useMemo(() => filterTree(items.models, searchQuery), [items.models, searchQuery]);
   const visibleExternal = useMemo(() => filterTree(items.external, searchQuery), [items.external, searchQuery]);

   return (
      <div
         className={`
              bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col
              transition-all duration-300 ease-in-out h-full ${className}
          `}
         style={{
            width: isVisible ? width : 0,
            opacity: isVisible ? 1 : 0,
            overflow: isVisible ? 'visible' : 'hidden',
            borderRightWidth: isVisible ? 1 : 0
         }}
      >
         {/* Resizer */}
         {isVisible && (
            <div
               className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-50 transition-colors"
               onMouseDown={(e) => { e.stopPropagation(); onResizeStart(); }}
            />
         )}

         <div className="flex flex-col h-full overflow-hidden" style={{ width: '100%' }}>
            {/* Header / Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider h-12 flex-shrink-0">
               {isSearchActive ? (
                  <div className="flex items-center flex-1 gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-nebula-500">
                     <Search size={12} className="text-nebula-500" />
                     <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => { if (!searchQuery) setIsSearchActive(false); }}
                        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
                        placeholder={t.searchFiles}
                     />
                     <button onClick={() => { setSearchQuery(''); setIsSearchActive(false); }}><X size={12} className="text-gray-400 hover:text-gray-600" /></button>
                  </div>
               ) : (
                  <>
                     <span>{t.explorerTitle}</span>
                     <button onClick={() => setIsSearchActive(true)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded" title="Search Files"><Search size={12} /></button>
                  </>
               )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">

               {/* Web Pages Group */}
               <div>
                  <div
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => onRootContextMenu(e, 'pages')}
                  >
                     <button
                        onClick={() => toggleSidebarGroup('pages')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                     >
                        {sidebarExpanded.pages ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Monitor size={14} className="text-blue-500" />
                        {t.expWeb}
                     </button>
                  </div>
                  {sidebarExpanded.pages && (
                     <div className="mt-1">
                        <WebExplorer
                           items={visiblePages}
                           activeFileId={activeFileId}
                           onSelect={onOpenFile}
                           onToggle={onToggleFolder}
                           onContextMenu={onContextMenu}
                           onMove={(d, t) => onMoveNode(d, t, 'pages')}
                        />
                     </div>
                  )}
               </div>

               {/* App Group */}
               <div className="mt-2">
                  <div
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => onRootContextMenu(e, 'apps')}
                  >
                     <button
                        onClick={() => toggleSidebarGroup('apps')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                     >
                        {sidebarExpanded.apps ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Smartphone size={14} className="text-purple-500" />
                        {t.expApp}
                     </button>
                  </div>
                  {sidebarExpanded.apps && (
                     <div className="mt-1">
                        <AppExplorer
                           items={visibleApps}
                           activeFileId={activeFileId}
                           onSelect={onOpenFile}
                           onToggle={onToggleFolder}
                           onContextMenu={onContextMenu}
                           onMove={(d, t) => onMoveNode(d, t, 'apps')}
                        />
                     </div>
                  )}
               </div>

               {/* Backend Group */}
               <div className="mt-2">
                  <div
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => onRootContextMenu(e, 'apis')}
                  >
                     <button
                        onClick={() => toggleSidebarGroup('apis')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                     >
                        {sidebarExpanded.apis ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Server size={14} className="text-green-500" />
                        {t.expBackend}
                     </button>
                  </div>
                  {sidebarExpanded.apis && (
                     <div className="mt-1">
                        <BackendExplorer
                           items={visibleApis}
                           activeFileId={activeFileId}
                           onSelect={onOpenFile}
                           onToggle={onToggleFolder}
                           onContextMenu={onContextMenu}
                           onMove={(d, t) => onMoveNode(d, t, 'apis')}
                        />
                     </div>
                  )}
               </div>

               {/* Database Group */}
               <div className="mt-2">
                  <div
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => onRootContextMenu(e, 'models')}
                  >
                     <button
                        onClick={() => toggleSidebarGroup('models')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                     >
                        {sidebarExpanded.models ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Database size={14} className="text-amber-500" />
                        {t.expDatabase}
                     </button>
                  </div>
                  {sidebarExpanded.models && (
                     <div className="mt-1">
                        <DatabaseExplorer
                           items={visibleModels}
                           activeFileId={activeFileId}
                           onSelect={onOpenFile}
                           onToggle={onToggleFolder}
                           onContextMenu={onContextMenu}
                           onMove={(d, t) => onMoveNode(d, t, 'models')}
                        />
                     </div>
                  )}
               </div>

               {/* External Interfaces Group */}
               <div className="mt-2">
                  <div
                     className="flex items-center justify-between group cursor-context-menu"
                     onContextMenu={(e) => onRootContextMenu(e, 'external')}
                  >
                     <button
                        onClick={() => toggleSidebarGroup('external')}
                        className="flex-1 flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                     >
                        {sidebarExpanded.external ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Globe size={14} className="text-purple-500" />
                        {t.expExternal}
                     </button>
                  </div>
                  {sidebarExpanded.external && (
                     <div className="mt-1">
                        <ExternalExplorer
                           items={visibleExternal}
                           activeFileId={activeFileId}
                           onSelect={onOpenFile}
                           onToggle={onToggleFolder}
                           onContextMenu={onContextMenu}
                           onMove={(d, t) => onMoveNode(d, t, 'external')}
                        />
                     </div>
                  )}
               </div>

            </div>
         </div>
      </div>
   );
};
