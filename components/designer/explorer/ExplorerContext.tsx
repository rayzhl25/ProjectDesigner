import React, { createContext, useContext } from 'react';
import { FileSystemItem } from '../../../types';

export interface ExplorerContextType {
    activeFileId: string | null;
    onSelect: (item: FileSystemItem) => void;
    onToggle: (itemId: string) => void;
    onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
    onMove?: (draggedId: string, targetId: string) => void;
    rootType?: string;
    showDetails?: boolean;
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export const useExplorerContext = () => {
    const context = useContext(ExplorerContext);
    if (!context) {
        throw new Error('useExplorerContext must be used within an ExplorerProvider');
    }
    return context;
};

export const ExplorerProvider: React.FC<{ value: ExplorerContextType; children: React.ReactNode }> = ({ value, children }) => {
    return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
};
