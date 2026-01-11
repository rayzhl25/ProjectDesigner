import React from 'react';
import { FileSystemItem } from '../../../types';
import { BaseTree } from './BaseTree';
import { ExplorerProvider } from './ExplorerContext';
import { getCommonFileIcon } from './commonIcons';

interface BackendExplorerProps {
    items: FileSystemItem[];
    activeFileId: string | null;
    onSelect: (item: FileSystemItem) => void;
    onToggle: (itemId: string) => void;
    onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
    onMove: (draggedId: string, targetId: string) => void;
    showDetails?: boolean;
}

export const BackendExplorer: React.FC<BackendExplorerProps> = (props) => {
    const contextValue = {
        activeFileId: props.activeFileId,
        onSelect: props.onSelect,
        onToggle: props.onToggle,
        onContextMenu: props.onContextMenu,
        onMove: props.onMove,
        rootType: 'apis',
        showDetails: props.showDetails
    };

    return (
        <ExplorerProvider value={contextValue}>
            <BaseTree
                items={props.items}
                getIcon={getCommonFileIcon}
            />
        </ExplorerProvider>
    );
};
