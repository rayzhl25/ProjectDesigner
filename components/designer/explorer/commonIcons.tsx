import React from 'react';
import {
    Folder, FolderOpen, FileCode2, Palette, Globe, FileJson,
    Coffee, Database, Code, List, Settings, ScrollText,
    Image as ImageIcon, FileText, Layout, Server, FileType2, GitGraph
} from 'lucide-react';
import { FileSystemItem } from '../../../types';

export const getCommonFileIcon = (item: FileSystemItem) => {
    // Check if folder
    if (item.type === 'folder') {
        return item.isOpen ?
            <FolderOpen size={14} className="text-yellow-500" /> :
            <Folder size={14} className="text-yellow-500" />;
    }

    // Git Repo
    if (item.type === 'git_repo') {
        return <GitGraph size={14} className="text-orange-600" />;
    }

    // Extension based
    const ext = item.name.split('.').pop()?.toLowerCase();

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
        case 'py': return <FileCode2 size={14} className="text-blue-600" />;
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

    // Fallback based on type
    switch (item.type) {
        case 'frontend': return <Layout size={14} className="text-blue-500" />;
        case 'backend': return <Server size={14} className="text-green-500" />;
        case 'database': return <Database size={14} className="text-amber-500" />;
        case 'externalApi': return <Globe size={14} className="text-purple-500" />;
        case 'settings': return <Settings size={14} className="text-gray-500" />;
        default: return <FileType2 size={14} className="text-gray-400" />;
    }
};
