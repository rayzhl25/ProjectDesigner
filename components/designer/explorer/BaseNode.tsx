import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FileSystemItem } from '../../../types';
import { useExplorerContext } from './ExplorerContext';

interface BaseNodeProps {
    item: FileSystemItem;
    level: number;
    icon: React.ReactNode;
    hasChildren: boolean;
    children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
    item,
    level,
    icon,
    hasChildren,
    children
}) => {
    const { activeFileId, onSelect, onToggle, onContextMenu, onMove, rootType, showDetails } = useExplorerContext();

    const isActive = activeFileId === item.id;
    const [isDragOver, setIsDragOver] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            onToggle(item.id);
        } else {
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
        e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, rootType }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
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
            if (data.rootType === rootType && data.id !== item.id && onMove) {
                onMove(data.id, item.id);
            }
        } catch (err) {
            console.error("Drop failed", err);
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

                {icon}

                <span className="truncate flex-1">{item.name}</span>

                {item.lastModified && showDetails && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0 font-mono">
                        {item.lastModified}
                    </span>
                )}
            </div>

            {/* Recursively render children if open */}
            {hasChildren && item.isOpen && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
};
