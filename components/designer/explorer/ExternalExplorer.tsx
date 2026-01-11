import React from 'react';
import { ServerCog } from 'lucide-react';
import { FileSystemItem } from '../../../types';
import { BaseTree } from './BaseTree';
import { ExplorerProvider } from './ExplorerContext';
import { getCommonFileIcon } from './commonIcons';

interface ExternalExplorerProps {
    items: FileSystemItem[];
    activeFileId: string | null;
    onSelect: (item: FileSystemItem) => void;
    onToggle: (itemId: string) => void;
    onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
    onMove: (draggedId: string, targetId: string) => void;
    showDetails?: boolean;
}

export const ExternalExplorer: React.FC<ExternalExplorerProps> = (props) => {
    const contextValue = {
        activeFileId: props.activeFileId,
        onSelect: props.onSelect,
        onToggle: props.onToggle,
        onContextMenu: props.onContextMenu,
        onMove: props.onMove,
        rootType: 'external',
        showDetails: props.showDetails
    };

    const getExternalIcon = (item: FileSystemItem) => {
        if (item.type === 'externalSys') return <ServerCog size={14} className="text-purple-500" />;
        return getCommonFileIcon(item);
    };

    return (
        <ExplorerProvider value={contextValue}>
            <BaseTree
                items={props.items}
                getIcon={getExternalIcon}
            />
        </ExplorerProvider>
    );
};
