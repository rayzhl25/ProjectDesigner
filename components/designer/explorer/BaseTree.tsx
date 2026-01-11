import React from 'react';
import { FileSystemItem } from '../../../types';
import { BaseNode } from './BaseNode';

interface BaseTreeProps {
    items: FileSystemItem[];
    level?: number;
    getIcon: (item: FileSystemItem) => React.ReactNode;
}

export const BaseTree: React.FC<BaseTreeProps> = ({
    items,
    level = 0,
    getIcon
}) => {
    return (
        <div className="select-none">
            {items.map(item => {
                const isFolder = item.type === 'folder' || item.type === 'dbGroup';
                const isSystem = item.type === 'externalSys' || item.type === 'dbConnection';
                const hasChildren = isFolder || isSystem;

                return (
                    <BaseNode
                        key={item.id}
                        item={item}
                        level={level}
                        icon={getIcon(item)}
                        hasChildren={hasChildren}
                    >
                        {hasChildren && item.children && (
                            <BaseTree
                                items={item.children}
                                level={level + 1}
                                getIcon={getIcon}
                            />
                        )}
                    </BaseNode>
                );
            })}
        </div>
    );
};
