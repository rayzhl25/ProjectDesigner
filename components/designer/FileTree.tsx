
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Layout,
  Server,
  Database,
  FileText,
  MoreHorizontal,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
  Globe,
  Scissors,
  ClipboardPaste,
  FolderInput,
  GitGraph,
  FileCode2,
  FileJson,
  Image as ImageIcon,
  Coffee,
  Settings,
  ScrollText,
  TableProperties,
  Palette,
  List,
  Code,
  Box,
  FileType2,
  ServerCog,
  Table as TableIcon,
  Eye,
  FunctionSquare,
  Zap,
  Terminal,
  Plug
} from 'lucide-react';
import { FileSystemItem, FileType } from '../../types';

interface FileTreeProps {
  items: FileSystemItem[];
  activeId: string | null;
  onSelect: (item: FileSystemItem) => void;
  onToggle: (itemId: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  onMove?: (draggedId: string, targetId: string) => void;
  level?: number;
  rootType?: string; // To ensure we don't drag between different roots (e.g. frontend to backend)
  showDetails?: boolean;
}

export const FileTree: React.FC<FileTreeProps> = ({
  items,
  activeId,
  onSelect,
  onToggle,
  onContextMenu,
  onMove,
  level = 0,
  rootType,
  showDetails = false
}) => {
  return (
    <div className="select-none">
      {items.map(item => (
        <FileTreeNode
          key={item.id}
          item={item}
          activeId={activeId}
          onSelect={onSelect}
          onToggle={onToggle}
          onContextMenu={onContextMenu}
          onMove={onMove}
          level={level}
          rootType={rootType}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
};

interface FileTreeNodeProps {
  item: FileSystemItem;
  activeId: string | null;
  onSelect: (item: FileSystemItem) => void;
  onToggle: (itemId: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  onMove?: (draggedId: string, targetId: string) => void;
  level: number;
  rootType?: string;
  showDetails?: boolean;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  item,
  activeId,
  onSelect,
  onToggle,
  onContextMenu,
  onMove,
  level,
  rootType,
  showDetails
}) => {
  const isFolder = item.type === 'folder' || item.type === 'dbGroup';
  const isSystem = item.type === 'externalSys' || item.type === 'dbConnection';
  const hasChildren = isFolder || isSystem; // Both can have children
  const isActive = activeId === item.id;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(item.id);
    } else {
      // For system and files, select/open
      onSelect(item);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(item.id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, item);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    // Payload: ID and the Root Type (to prevent cross-tree dropping)
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, rootType }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      // Validation: 
      // 1. Same tree type
      // 2. Don't drop on itself
      // 3. Special rule for External System children: Can move to other folders, BUT root of External is always a System.
      //    So we can move 'externalApi' or 'folder' (ExternalDir) into other folders.
      //    We can NOT move the External System itself into another System (unless we support nested systems, which we don't seem to).
      if (data.rootType === rootType && data.id !== item.id && onMove) {
        onMove(data.id, item.id);
      }
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  const getIcon = () => {
    if (isFolder) {
      // Specific Database Group Icons
      if (item.name === 'Tables') return <TableIcon size={14} className="text-amber-600" />;
      if (item.name === 'Views') return <Eye size={14} className="text-blue-500" />;
      if (item.name === 'Functions') return <FunctionSquare size={14} className="text-purple-500" />;
      if (item.name === 'Procedures') return <ScrollText size={14} className="text-indigo-500" />;
      if (item.name === 'Triggers') return <Zap size={14} className="text-yellow-500" />;
      if (item.name === 'Queries') return <Terminal size={14} className="text-gray-500" />;

      return item.isOpen ?
        <FolderOpen size={14} className="text-yellow-500" /> :
        <Folder size={14} className="text-yellow-500" />;
    }

    if (isSystem) {
      if (item.type === 'dbConnection') return <Database size={14} className="text-amber-600" />;
      return <ServerCog size={14} className="text-purple-500" />;
    }

    // --- Specific DB Items ---
    switch (item.type) {
      case 'dbTable': return <TableProperties size={14} className="text-amber-500" />;
      case 'dbView': return <Eye size={14} className="text-blue-400" />;
      case 'dbFunc': return <FunctionSquare size={14} className="text-purple-400" />;
      case 'dbProc': return <ScrollText size={14} className="text-indigo-400" />;
      case 'dbTrigger': return <Zap size={14} className="text-yellow-400" />;
      case 'dbQuery': return <FileCode2 size={14} className="text-gray-400" />;
    }

    // Identify extension
    const ext = item.name.split('.').pop()?.toLowerCase();

    // --- Specific File Extensions ---
    switch (ext) {
      // Web / Frontend
      case 'vue': return <FileCode2 size={14} className="text-emerald-500" />;
      case 'jsx':
      case 'tsx':
      case 'react': return <FileCode2 size={14} className="text-blue-400" />;
      case 'js':
      case 'mjs': return <FileCode2 size={14} className="text-yellow-400" />;
      case 'ts': return <FileCode2 size={14} className="text-blue-500" />;
      case 'css':
      case 'scss':
      case 'less': return <Palette size={14} className="text-pink-400" />;
      case 'html': return <Globe size={14} className="text-orange-500" />;
      case 'json': return <FileJson size={14} className="text-yellow-600" />;

      // Backend / Data
      case 'java': return <Coffee size={14} className="text-red-500" />;
      case 'py': return <FileCode2 size={14} className="text-blue-600" />; // Python often blue/yellow
      case 'sql': return <Database size={14} className="text-amber-500" />;
      case 'xml': return <Code size={14} className="text-orange-600" />;
      case 'yaml':
      case 'yml': return <List size={14} className="text-purple-500" />;
      case 'properties':
      case 'conf':
      case 'env': return <Settings size={14} className="text-gray-500" />;
      case 'log': return <ScrollText size={14} className="text-gray-400" />;

      // Documents / Assets
      case 'md':
      case 'txt': return <FileText size={14} className="text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
      case 'webp': return <ImageIcon size={14} className="text-purple-400" />;
    }

    // --- Fallback to generic types ---
    switch (item.type) {
      case 'frontend': return <Layout size={14} className="text-blue-500" />;
      case 'backend': return <Server size={14} className="text-green-500" />;
      case 'database': return <Database size={14} className="text-amber-500" />;
      case 'externalApi': return <Globe size={14} className="text-purple-500" />;
      case 'settings': return <Settings size={14} className="text-gray-500" />;
      case 'git_repo': return <GitGraph size={14} className="text-orange-600" />;
      default: return <FileType2 size={14} className="text-gray-400" />;
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-1.5 py-1 px-2 cursor-pointer text-xs border-l-2 transition-colors
          ${isActive
            ? 'bg-nebula-100 dark:bg-nebula-900/30 text-nebula-700 dark:text-white border-nebula-500'
            : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          ${isDragOver ? 'bg-nebula-50 dark:bg-nebula-900/50 outline outline-2 outline-nebula-400 -outline-offset-2' : ''}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Toggle Arrow */}
        <span
          className={`opacity-70 flex-shrink-0 w-4 flex justify-center ${hasChildren ? 'hover:text-nebula-500' : ''}`}
          onClick={hasChildren ? handleToggleClick : undefined}
        >
          {hasChildren && (
            item.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
        </span>

        {getIcon()}

        <span className="truncate flex-1">{item.name}</span>

        {item.lastModified && showDetails && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 font-mono">
            {item.lastModified}
          </span>
        )}
      </div>

      {hasChildren && item.isOpen && item.children && (
        <FileTree
          items={item.children}
          activeId={activeId}
          onSelect={onSelect}
          onToggle={onToggle}
          onContextMenu={onContextMenu}
          onMove={onMove}
          level={level + 1}
          rootType={rootType}
          showDetails={showDetails}
        />
      )}
    </div>
  );
};

// --- Context Menu ---

export type ContextMenuType = 'node' | 'root';

interface ContextMenuProps {
  x: number;
  y: number;
  targetItem: FileSystemItem | null; // Null if it's a root context menu
  rootType?: string; // 'pages', 'apps', etc. Used when targetItem is null
  onClose: () => void;
  onAction: (action: string, item: FileSystemItem | null, rootType?: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetItem, rootType, onClose, onAction }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const isFolder = targetItem ? (targetItem.type === 'folder' || targetItem.type === 'externalSys' || targetItem.type === 'dbConnection') : true;

  // Specific DB Connection Menu
  if (targetItem?.type === 'dbConnection') {
    return (
      <div
        ref={ref}
        className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs text-gray-700 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-100"
        style={{ top: y, left: x }}
      >
        <button
          className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => onAction('db_config', targetItem)}
        >
          <Settings size={14} className="text-gray-500" /> 连接配置
        </button>
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        <button
          className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
          onClick={() => onAction('delete', targetItem)}
        >
          <Trash2 size={14} /> 删除
        </button>
      </div>
    )
  }

  // Specific External System Menu
  if (targetItem?.type === 'externalSys') {
    return (
      <div
        ref={ref}
        className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs text-gray-700 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-100"
        style={{ top: y, left: x }}
      >
        <button
          className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => onAction('db_config', targetItem)} // Reusing db_config for System Config as per existing logic
        >
          <Settings size={14} className="text-gray-500" /> 系统配置
        </button>
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        <button
          className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => onAction('new_file', targetItem, rootType)}
        >
          <FilePlus size={14} /> 新建接口
        </button>
        <button
          className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => onAction('new_folder', targetItem, rootType)}
        >
          <FolderPlus size={14} /> 新建文件夹
        </button>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-xs text-gray-700 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      {/* Specific Root Actions */}
      {rootType === 'models' && !targetItem && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('connect_db', null, rootType)}
          >
            <Database size={14} className="text-amber-500" /> 新建数据库连接
          </button>
          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        </>
      )}

      {rootType === 'external' && !targetItem && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('new_sys', null, rootType)}
          >
            <ServerCog size={14} className="text-purple-500" /> 新建外部系统
          </button>
          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        </>
      )}

      {/* Root / Folder Actions (Excluding dbConnection, External System, and External Root) */}
      {isFolder && targetItem?.type !== 'dbGroup' && rootType !== 'models' && rootType !== 'external' && targetItem?.type !== 'externalSys' && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('new_file', targetItem, rootType)}
          >
            <FilePlus size={14} /> 新建文件
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('new_folder', targetItem, rootType)}
          >
            <FolderPlus size={14} /> 新建文件夹
          </button>

          {/* Paste available for folders */}
          {targetItem && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('paste', targetItem)}
            >
              <ClipboardPaste size={14} /> 粘贴
            </button>
          )}

          {/* Root Only Actions */}
          {!targetItem && rootType !== 'external' && (
            <>
              <button
                className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => onAction('open_dir', null, rootType)}
              >
                <FolderInput size={14} /> 本地项目
              </button>

              {/* Git Repo Action - Only for Web(pages), App(apps), Backend(apis) */}
              {['pages', 'apps', 'apis'].includes(rootType || '') && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => onAction('open_git', null, rootType)}
                >
                  <GitGraph size={14} /> 代码仓库
                </button>
              )}
            </>
          )}

          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
        </>
      )}

      {/* Database Group Specific Actions */}
      {targetItem && targetItem.type === 'dbGroup' && (
        <>
          {targetItem.name === 'Tables' && (
            <>
              <button
                className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => onAction('new_table', targetItem)}
              >
                <TableProperties size={14} className="text-amber-500" /> 新建表
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
                onClick={() => onAction('er_diagram', targetItem)}
              >
                <GitGraph size={14} className="text-blue-500" /> ER图
              </button>
            </>
          )}

          {targetItem.name === 'Views' && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('new_view', targetItem)}
            >
              <Eye size={14} className="text-blue-400" /> 新建视图
            </button>
          )}

          {targetItem.name === 'Functions' && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('new_func', targetItem)}
            >
              <FunctionSquare size={14} className="text-purple-400" /> 新建函数
            </button>
          )}

          {targetItem.name === 'Procedures' && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('new_proc', targetItem)}
            >
              <ScrollText size={14} className="text-indigo-400" /> 新建存储过程
            </button>
          )}

          {targetItem.name === 'Triggers' && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('new_trigger', targetItem)}
            >
              <Zap size={14} className="text-yellow-400" /> 新建触发器
            </button>
          )}

          {targetItem.name === 'Queries' && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => onAction('new_query', targetItem)}
            >
              <FileCode2 size={14} /> 新建查询
            </button>
          )}
        </>
      )}

      {/* Node Specific Actions (Not for Root) */}
      {targetItem && targetItem.type !== 'dbGroup' && (
        <>
          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('cut', targetItem)}
          >
            <Scissors size={14} /> 剪切
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('copy', targetItem)}
          >
            <Copy size={14} /> 复制
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('duplicate', targetItem)}
          >
            <Copy size={14} /> 创建副本
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-nebula-50 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => onAction('rename', targetItem)}
          >
            <Pencil size={14} /> 重命名
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
            onClick={() => onAction('delete', targetItem)}
          >
            <Trash2 size={14} /> 删除
          </button>
        </>
      )}
    </div>
  );
};
