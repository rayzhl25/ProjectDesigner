import React from 'react';
import {
    Table as TableIcon, Eye, FunctionSquare, ScrollText, Zap,
    Terminal, FolderOpen, Folder, Database, ServerCog, TableProperties, FileCode2
} from 'lucide-react';
import { FileSystemItem } from '../../../types';
import { BaseTree } from './BaseTree';
import { ExplorerProvider } from './ExplorerContext';
import { getCommonFileIcon } from './commonIcons';

interface DatabaseExplorerProps {
    items: FileSystemItem[];
    activeFileId: string | null;
    onSelect: (item: FileSystemItem) => void;
    onToggle: (itemId: string) => void;
    onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
    onMove: (draggedId: string, targetId: string) => void;
    showDetails?: boolean;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = (props) => {
    const contextValue = {
        activeFileId: props.activeFileId,
        onSelect: props.onSelect,
        onToggle: props.onToggle,
        onContextMenu: props.onContextMenu,
        onMove: props.onMove,
        rootType: 'models',
        showDetails: props.showDetails
    };

    const getDbIcon = (item: FileSystemItem) => {
        if (item.type === 'folder' || item.type === 'dbGroup') {
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

        if (item.type === 'dbConnection') {
            return <Database size={14} className="text-amber-600" />;
        }

        if (item.type === 'externalSys') { // Fallback, though usually logic above for dbConnection handles it
            return <ServerCog size={14} className="text-purple-500" />;
        }

        // Specific DB Items
        switch (item.type) {
            case 'dbTable': return <TableProperties size={14} className="text-amber-500" />;
            case 'dbView': return <Eye size={14} className="text-blue-400" />;
            case 'dbFunc': return <FunctionSquare size={14} className="text-purple-400" />;
            case 'dbProc': return <ScrollText size={14} className="text-indigo-400" />;
            case 'dbTrigger': return <Zap size={14} className="text-yellow-400" />;
            case 'dbQuery': return <FileCode2 size={14} className="text-gray-400" />;
        }

        return getCommonFileIcon(item);
    };

    return (
        <ExplorerProvider value={contextValue}>
            <BaseTree
                items={props.items}
                getIcon={getDbIcon}
            />
        </ExplorerProvider>
    );
};
