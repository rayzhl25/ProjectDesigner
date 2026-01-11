
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    GitBranch,
    RefreshCw,
    UploadCloud,
    DownloadCloud,
    Check,
    Plus,
    Minus,
    FileCode,
    ArrowRight,
    History,
    GitCommit,
    ArrowDown,
    ArrowUp,
    Download,
    Loader2,
    AlertCircle,
    MoreHorizontal,
    Folder,
    FolderOpen,
    List as ListIcon,
    Network,
    GitMerge,
    Trash2,
    Undo2,
    Layers,
    Search,
    Terminal,
    Copy,
    X,
    GitGraph as GitGraphIcon,
    CloudOff
} from 'lucide-react';
import { LOCALE } from '../../constants';
import { Language, GitCommit as IGitCommit, GitFileStatus, GitDiffLine } from '../../types';
import { fetchGitChanges, fetchGitHistory, performGitAction } from '../../services/mockService';

interface GitRepositoryProps {
    lang: Language;
    rootType: string;
}

// Tree Node Structure
interface FileNode {
    id: string;
    name: string;
    fullPath: string;
    type: 'folder' | 'file';
    children: Record<string, FileNode>;
    fileData?: GitFileStatus; // Only for files
}

const PROJECT_VAR = '$PROJECT_DIR';

const GitRepository: React.FC<GitRepositoryProps> = ({ lang, rootType }) => {
    const t = LOCALE[lang];

    // -- State: Config --
    const [repoUrl, setRepoUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectLoading, setConnectLoading] = useState(false);

    // -- State: Git Data --
    const [currentBranch, setCurrentBranch] = useState('main');
    const [branches, setBranches] = useState(['main', 'develop', 'feature/login-page', 'hotfix/v1.0.1']);
    const [commitMessage, setCommitMessage] = useState('');

    // -- State: View & Selection --
    const [viewMode, setViewMode] = useState<'changes' | 'history'>('changes');
    const [fileViewType, setFileViewType] = useState<'list' | 'tree'>('list'); // List vs Tree toggle for changes
    const [historyViewType, setHistoryViewType] = useState<'list' | 'graph'>('list'); // List vs Graph for history
    const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    // -- State: Data from Backend --
    const [workingChanges, setWorkingChanges] = useState<GitFileStatus[]>([]);
    const [commitHistory, setCommitHistory] = useState<IGitCommit[]>([]);

    // -- State: Staging --
    const [stagedFiles, setStagedFiles] = useState<string[]>([]); // IDs of staged files

    // -- State: Layout --
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [historyPaneHeight, setHistoryPaneHeight] = useState(300);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [isResizingHistoryPane, setIsResizingHistoryPane] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);

    // -- State: Modals/Popups --
    const [showBranchMenu, setShowBranchMenu] = useState(false);

    // -- State: Feedback --
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [commandLogs, setCommandLogs] = useState<string[]>([]);

    // Refs
    const leftCodeRef = useRef<HTMLDivElement>(null);
    const rightCodeRef = useRef<HTMLDivElement>(null);
    const diffContainerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef<'left' | 'right' | null>(null);

    // --- Initial Data Load ---
    useEffect(() => {
        if (isConnected) {
            loadGitData();
        }
    }, [isConnected]);

    const loadGitData = async () => {
        setActionLoading('fetch');
        try {
            const [changes, history] = await Promise.all([
                fetchGitChanges(),
                fetchGitHistory()
            ]);
            setWorkingChanges(changes);
            setCommitHistory(history);
        } catch (error) {
            console.error("Failed to load git data", error);
        } finally {
            setActionLoading(null);
        }
    };

    // --- Derived State ---

    const unstagedList = workingChanges.filter(f => !stagedFiles.includes(f.id));
    const stagedList = workingChanges.filter(f => stagedFiles.includes(f.id));

    const displayFiles = viewMode === 'changes'
        ? workingChanges
        : (commitHistory.find(c => c.id === selectedCommitId)?.files || []);

    const displayDiff = displayFiles.find(f => f.id === selectedFileId);

    // --- Log Logic ---
    const logCommand = (cmd: string) => {
        const fullCmd = `user@nebula-dev:~/project$ ${cmd}`;
        setCommandLogs(prev => [...prev, fullCmd]);
        setTimeout(() => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        }, 100);
    };

    const addGitLog = (action: string, args: string = '') => {
        // Use unified variable for project directory
        const base = `cd ${PROJECT_VAR} &&`;
        let gitCmd = '';
        switch (action) {
            case 'connect': gitCmd = `git remote add origin ${args}`; break;
            case 'pull': gitCmd = `git pull origin ${currentBranch}`; break;
            case 'push': gitCmd = `git push origin ${currentBranch}`; break;
            case 'fetch': gitCmd = `git fetch origin`; break;
            case 'commit': gitCmd = `git add . && git commit -m "${args}"`; break;
            case 'stage': gitCmd = `git add "${args}"`; break;
            case 'unstage': gitCmd = `git reset HEAD "${args}"`; break;
            case 'checkout': gitCmd = `git checkout ${args}`; break;
            case 'create_branch': gitCmd = `git checkout -b ${args}`; break;
            case 'delete_branch': gitCmd = `git branch -d ${args}`; break;
            case 'delete_remote': gitCmd = `git push origin --delete ${args}`; break;
            case 'merge': gitCmd = `git merge ${args}`; break;
            case 'discard': gitCmd = `git checkout -- "${args}"`; break;
            default: gitCmd = `git ${action} ${args}`;
        }
        logCommand(`${base} ${gitCmd}`);
    };

    // --- Actions ---

    const handleConnect = () => {
        if (repoUrl) {
            setConnectLoading(true);
            setTimeout(() => {
                setIsConnected(true);
                setConnectLoading(false);
                showStatus('success', t.gitConnectSuccess);
                addGitLog('connect', repoUrl);
            }, 1000);
        }
    };

    const handleAction = async (action: string) => {
        if (actionLoading) return;

        if (action === 'commit') {
            // 1. Determine files to commit
            let filesToCommit = stagedList;
            let isStageAll = false;
            if (filesToCommit.length === 0) {
                // Stage All if nothing selected
                filesToCommit = unstagedList;
                isStageAll = true;
            }

            if (filesToCommit.length === 0) {
                showStatus('error', 'No changes to commit');
                return;
            }

            setActionLoading(action);
            if (isStageAll) {
                addGitLog('stage', '.');
            }
            addGitLog('commit', commitMessage);

            await performGitAction('commit', { message: commitMessage, files: filesToCommit.map(f => f.id) });

            // Refresh Data
            loadGitData();
            setStagedFiles([]);
            setCommitMessage('');
            if (selectedFileId) setSelectedFileId(null);
            showStatus('success', 'Committed successfully');
            setActionLoading(null);

        } else {
            setActionLoading(action);
            addGitLog(action);
            await performGitAction(action, {});

            if (action === 'fetch' || action === 'pull') {
                loadGitData();
            }

            showStatus('success', `${action} completed successfully`);
            setActionLoading(null);
        }
    };

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 3000);
    };

    const handleStage = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const file = workingChanges.find(f => f.id === id);
        if (file && !stagedFiles.includes(id)) {
            setStagedFiles([...stagedFiles, id]);
            addGitLog('stage', file.name);
        }
    };

    const handleUnstage = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const file = workingChanges.find(f => f.id === id);
        if (file) {
            setStagedFiles(stagedFiles.filter(fid => fid !== id));
            addGitLog('unstage', file.name);
        }
    };

    const handleDiscard = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const file = workingChanges.find(f => f.id === id);
        if (file) {
            if (confirm(`Are you sure you want to discard changes in ${file.name}? This cannot be undone.`)) {
                addGitLog('discard', file.name);
                performGitAction('discard', { fileId: id }).then(() => {
                    setWorkingChanges(prev => prev.filter(f => f.id !== id));
                    if (selectedFileId === id) setSelectedFileId(null);
                    showStatus('success', 'Changes discarded');
                });
            }
        }
    };

    const handleBranchAction = (action: string, value?: string) => {
        setShowBranchMenu(false);
        if (action === 'create') {
            const name = prompt('Enter new branch name:');
            if (name) {
                setBranches([...branches, name]);
                setCurrentBranch(name);
                showStatus('success', `Branch ${name} created`);
                addGitLog('create_branch', name);
            }
        } else if (action === 'delete') {
            if (confirm(`Delete local branch ${currentBranch}?`)) {
                addGitLog('delete_branch', currentBranch);
                setBranches(branches.filter(b => b !== currentBranch));
                setCurrentBranch('main');
                showStatus('success', `Branch ${currentBranch} deleted`);
            }
        } else if (action === 'delete_remote') {
            const name = prompt('Enter remote branch name to delete (e.g. feature/old):');
            if (name) {
                addGitLog('delete_remote', name);
                showStatus('success', `Remote branch ${name} deleted`);
            }
        } else if (action === 'merge') {
            const name = prompt(`Enter branch name to merge into ${currentBranch}:`);
            if (name) {
                addGitLog('merge', name);
                showStatus('success', `Merged ${name} into ${currentBranch}`);
            }
        } else if (action === 'checkout' && value) {
            setCurrentBranch(value);
            showStatus('success', `Switched to ${value}`);
            addGitLog('checkout', value);
        }
    };

    const handleCopyLogs = () => {
        const script = "#!/bin/bash\n# Generated by Nebula LowCode\n\n" + commandLogs.map(l => l.replace('user@nebula-dev:~/project$ ', '')).join('\n');
        navigator.clipboard.writeText(script);
        showStatus('success', 'Git commands copied to clipboard');
    };

    // --- Tree Rendering ---
    const buildFileTree = (files: GitFileStatus[]) => {
        const root: Record<string, FileNode> = {};
        files.forEach(file => {
            const parts = file.name.split('/');
            let currentLevel = root;
            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                const id = isFile ? file.id : `dir_${parts.slice(0, index + 1).join('_')}`;
                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        id, name: part, fullPath: parts.slice(0, index + 1).join('/'),
                        type: isFile ? 'file' : 'folder', children: {}, fileData: isFile ? file : undefined
                    };
                }
                currentLevel = currentLevel[part].children;
            });
        });
        return root;
    };

    const renderTree = (nodes: Record<string, FileNode>, depth: number = 0, isStagedContext: boolean = false) => {
        return Object.values(nodes).map(node => (
            <div key={node.id}>
                {node.type === 'folder' ? (
                    <>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 select-none text-xs font-medium" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
                            <Folder size={14} className="text-yellow-500" /><span>{node.name}</span>
                        </div>
                        {renderTree(node.children, depth + 1, isStagedContext)}
                    </>
                ) : (
                    <FileItem
                        file={node.fileData!}
                        isSelected={selectedFileId === node.id}
                        onSelect={() => setSelectedFileId(node.id)}
                        isStaged={isStagedContext}
                        onStage={handleStage}
                        onUnstage={handleUnstage}
                        onDiscard={handleDiscard}
                        style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    />
                )}
            </div>
        ));
    };

    const renderFileList = (files: GitFileStatus[], isStagedContext: boolean) => {
        if (fileViewType === 'list') {
            return files.map(file => (
                <FileItem
                    key={file.id}
                    file={file}
                    isSelected={selectedFileId === file.id}
                    onSelect={() => setSelectedFileId(file.id)}
                    isStaged={isStagedContext}
                    onStage={handleStage}
                    onUnstage={handleUnstage}
                    onDiscard={handleDiscard}
                />
            ));
        } else {
            const tree = buildFileTree(files);
            return renderTree(tree, 0, isStagedContext);
        }
    };

    // Sync Scroll Logic
    const handleScroll = (e: React.UIEvent<HTMLDivElement>, source: 'left' | 'right') => {
        if (isScrollingRef.current && isScrollingRef.current !== source) return;
        isScrollingRef.current = source;
        const targetRef = source === 'left' ? rightCodeRef : leftCodeRef;
        if (targetRef.current) {
            targetRef.current.scrollTop = e.currentTarget.scrollTop;
            targetRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
        setTimeout(() => { isScrollingRef.current = null; }, 50);
    };

    // Resize Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingSidebar) {
                setSidebarWidth(prev => Math.max(250, Math.min(600, prev + e.movementX)));
            }
            if (isResizingHistoryPane) {
                setHistoryPaneHeight(prev => Math.max(150, Math.min(600, prev - e.movementY)));
            }
        };
        const handleMouseUp = () => {
            setIsResizingSidebar(false);
            setIsResizingHistoryPane(false);
        };
        if (isResizingSidebar || isResizingHistoryPane) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = isResizingSidebar ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingSidebar, isResizingHistoryPane]);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-sm overflow-hidden">
            {/* 1. Top Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between flex-shrink-0 relative z-20">
                {statusMsg && <div className={`absolute top-0 left-0 right-0 h-0.5 ${statusMsg.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />}

                {isConnected ? (
                    <>
                        <div className="flex items-center gap-2">
                            {/* Branch Dropdown */}
                            <div className="relative">
                                <button onClick={() => setShowBranchMenu(!showBranchMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 font-medium transition-colors text-xs">
                                    <GitBranch size={14} />{currentBranch}<ArrowDown size={12} className="opacity-50" />
                                </button>
                                {showBranchMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                                        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Switch Branch</div>
                                        <div className="max-h-40 overflow-y-auto">
                                            {branches.map(b => (
                                                <button key={b} onClick={() => handleBranchAction('checkout', b)} className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${currentBranch === b ? 'text-nebula-600 font-bold bg-nebula-50 dark:bg-nebula-900/20' : 'text-gray-700 dark:text-gray-300'}`}>{b}{currentBranch === b && <Check size={12} />}</button>
                                            ))}
                                        </div>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                        <button onClick={() => handleBranchAction('create')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"><Plus size={14} /> Create Branch</button>
                                        <button onClick={() => handleBranchAction('merge')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"><GitMerge size={14} /> Merge Branch</button>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                        <button onClick={() => handleBranchAction('delete')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"><Trash2 size={14} /> Delete Local</button>
                                        <button onClick={() => handleBranchAction('delete_remote')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"><CloudOff size={14} /> Delete Remote</button>
                                    </div>
                                )}
                            </div>
                            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <ActionBtn icon={DownloadCloud} label={t.gitPull} loading={actionLoading === 'pull'} onClick={() => handleAction('pull')} />
                            <ActionBtn icon={UploadCloud} label={t.gitPush} loading={actionLoading === 'push'} onClick={() => handleAction('push')} />
                            <ActionBtn icon={RefreshCw} tooltip="Fetch" loading={actionLoading === 'fetch'} onClick={() => handleAction('fetch')} />
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg">
                            <TabBtn label={t.gitChanges} active={viewMode === 'changes'} onClick={() => setViewMode('changes')} />
                            <TabBtn label={t.gitHistory} active={viewMode === 'history'} onClick={() => setViewMode('history')} />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex gap-2">
                        <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder={t.gitRepoUrl} disabled={connectLoading} className="flex-1 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-nebula-500 outline-none" />
                        <button onClick={handleConnect} disabled={connectLoading} className="px-3 py-1.5 bg-nebula-600 text-white rounded hover:bg-nebula-700 text-xs font-medium min-w-[80px] flex justify-center">{connectLoading ? <Loader2 className="animate-spin" size={14} /> : t.gitConnect}</button>
                    </div>
                )}
            </div>

            {/* 2. Main Body */}
            {isConnected ? (
                <div className="flex-1 flex overflow-hidden relative">

                    {/* LEFT SIDEBAR */}
                    <div style={{ width: sidebarWidth }} className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 relative z-10">
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-nebula-500 z-20 hover:w-1.5 transition-all active:bg-nebula-600" onMouseDown={() => setIsResizingSidebar(true)} />

                        {viewMode === 'changes' ? (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                                    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">SOURCE CONTROL</div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setFileViewType('list')} className={`p-1 rounded ${fileViewType === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-400 hover:text-gray-600'}`}><ListIcon size={12} /></button>
                                        <button onClick={() => setFileViewType('tree')} className={`p-1 rounded ${fileViewType === 'tree' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-400 hover:text-gray-600'}`}><Network size={12} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {stagedFiles.length > 0 && <div className="mb-2"><div className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-700/30 flex justify-between"><span>{t.gitStaged}</span><span className="bg-nebula-100 text-nebula-700 px-1.5 rounded-full">{stagedFiles.length}</span></div><div className="py-1">{renderFileList(stagedList, true)}</div></div>}
                                    <div><div className="px-3 py-1.5 text-xs font-bold text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-700/30 flex justify-between"><span>{t.gitChanges}</span><span className="bg-gray-200 text-gray-700 px-1.5 rounded-full">{unstagedList.length}</span></div><div className="py-1">{renderFileList(unstagedList, false)}</div></div>
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <textarea value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} placeholder={t.gitMessagePlaceholder} className="w-full h-20 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs resize-none outline-none focus:border-nebula-500 mb-2" />
                                    <button
                                        onClick={() => handleAction('commit')}
                                        disabled={!commitMessage.trim() || (stagedFiles.length === 0 && workingChanges.length === 0) || !!actionLoading}
                                        className="w-full py-1.5 bg-nebula-600 text-white rounded-md text-xs font-bold hover:bg-nebula-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {actionLoading === 'commit' ? <Loader2 size={12} className="animate-spin" /> : <GitCommit size={12} />} {t.gitCommit}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // HISTORY MODE
                            <div className="flex flex-col h-full">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-600 text-xs uppercase bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                                    <span>{t.gitHistory} ({commitHistory.length})</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => setHistoryViewType('list')} className={`p-1 rounded ${historyViewType === 'list' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600' : 'text-gray-400'}`}><ListIcon size={10} /></button>
                                        <button onClick={() => setHistoryViewType('graph')} className={`p-1 rounded ${historyViewType === 'graph' ? 'bg-white dark:bg-gray-600 shadow text-nebula-600' : 'text-gray-400'}`}><GitGraphIcon size={10} /></button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 overflow-y-auto">
                                    {historyViewType === 'list' ? (
                                        // List View
                                        commitHistory.map(commit => (
                                            <div key={commit.id} onClick={() => { setSelectedCommitId(commit.id); setSelectedFileId(null); }} className={`p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative group ${selectedCommitId === commit.id ? 'bg-nebula-50 dark:bg-nebula-900/20' : ''}`}>
                                                {selectedCommitId === commit.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-nebula-500"></div>}
                                                <div className="flex items-start gap-2 mb-1">
                                                    <div className="mt-0.5"><GitCommit size={14} className="text-nebula-500" /></div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-gray-800 dark:text-gray-200 text-xs truncate">{commit.message}</div>
                                                        <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>{commit.author}</span><span>{commit.date.slice(5)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Graph View (SVG)
                                        <div className="relative min-h-full">
                                            <svg className="absolute top-0 left-0 w-8 h-full pointer-events-none" style={{ height: commitHistory.length * 40 }}>
                                                {commitHistory.map((commit, i) => {
                                                    const x = commit.branch === 'main' ? 14 : 26;
                                                    const y = i * 40 + 20;
                                                    const nextY = (i + 1) * 40 + 20;
                                                    // Draw line to next if exists (simplified linear + branch merge visual)
                                                    const isLast = i === commitHistory.length - 1;
                                                    return (
                                                        <g key={commit.id}>
                                                            {!isLast && <line x1={x} y1={y} x2={commit.branch === commitHistory[i + 1]?.branch ? x : (commitHistory[i + 1]?.branch === 'main' ? 14 : 26)} y2={nextY} stroke={commit.branch === 'main' ? '#3b82f6' : '#8b5cf6'} strokeWidth="2" />}
                                                            <circle cx={x} cy={y} r="4" fill={commit.branch === 'main' ? '#3b82f6' : '#8b5cf6'} />
                                                        </g>
                                                    )
                                                })}
                                            </svg>
                                            <div className="pl-8">
                                                {commitHistory.map(commit => (
                                                    <div key={commit.id} onClick={() => { setSelectedCommitId(commit.id); setSelectedFileId(null); }} className={`h-10 flex items-center px-2 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-xs ${selectedCommitId === commit.id ? 'bg-nebula-50 dark:bg-nebula-900/20' : ''}`}>
                                                        <div className="truncate flex-1">{commit.message}</div>
                                                        <div className="text-[10px] text-gray-400 w-16 text-right">{commit.date.slice(5, 10)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Selected Commit Files */}
                                {selectedCommitId && (
                                    <div style={{ height: historyPaneHeight }} className="flex flex-col border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 relative flex-shrink-0">
                                        <div className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-nebula-500 z-20 hover:h-1.5 transition-all" onMouseDown={() => setIsResizingHistoryPane(true)} />
                                        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">{t.gitChanges}</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => setFileViewType('list')} className={`p-0.5 rounded ${fileViewType === 'list' ? 'bg-white shadow' : 'text-gray-400'}`}><ListIcon size={10} /></button>
                                                <button onClick={() => setFileViewType('tree')} className={`p-0.5 rounded ${fileViewType === 'tree' ? 'bg-white shadow' : 'text-gray-400'}`}><Network size={10} /></button>
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-1">
                                            {renderFileList(displayFiles, false)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT MAIN AREA: Diff Viewer */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col min-w-0 relative">
                        {displayDiff ? (
                            <div className="flex-1 flex flex-col h-full">
                                {/* Diff Header */}
                                <div className="h-9 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex-shrink-0">
                                    <span className="flex items-center gap-2 text-xs">
                                        <FileCode size={14} className="text-blue-500" />
                                        <span className="font-mono font-medium">{displayDiff.name}</span>
                                    </span>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> {displayDiff.leftLines.filter(l => l.type === 'remove').length}</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-sm"></div> {displayDiff.rightLines.filter(l => l.type === 'add').length}</span>
                                        {viewMode === 'history' && <button className="flex items-center gap-1 hover:text-nebula-600 transition-colors"><Download size={12} /> {t.gitPullFile}</button>}
                                    </div>
                                </div>

                                {/* Dual Pane Comparison */}
                                <div className="flex-1 flex overflow-hidden relative font-mono text-xs" ref={diffContainerRef}>
                                    <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-w-0">
                                        <div ref={leftCodeRef} onScroll={(e) => handleScroll(e, 'left')} className="flex-1 overflow-auto custom-scrollbar pb-10">
                                            {displayDiff.leftLines.map((line, idx) => <DiffLineRender key={idx} line={line} side="left" />)}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-w-0">
                                        <div ref={rightCodeRef} onScroll={(e) => handleScroll(e, 'right')} className="flex-1 overflow-auto custom-scrollbar pb-10">
                                            {displayDiff.rightLines.map((line, idx) => <DiffLineRender key={idx} line={line} side="right" />)}
                                        </div>
                                    </div>
                                    {/* WIDER MINIMAP */}
                                    <div className="absolute right-0 top-0 bottom-0 w-5 bg-transparent z-10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                        <DiffMinimap diff={displayDiff} containerRef={rightCodeRef} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 dark:bg-gray-900/30 select-none">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    {viewMode === 'history' ? <History size={32} className="opacity-50" /> : <FileCode size={32} className="opacity-50" />}
                                </div>
                                <p className="font-medium text-sm">{viewMode === 'history' && !selectedCommitId ? 'Select a commit to view details' : t.gitNoChanges}</p>
                            </div>
                        )}

                        {/* TERMINAL PANEL */}
                        <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ${showTerminal ? 'h-48' : 'h-8'}`}>
                            <div className="flex items-center justify-between px-4 h-8 bg-gray-50 dark:bg-gray-800 cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                                    <Terminal size={12} /> Git Output
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleCopyLogs(); }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="Copy Script"><Copy size={12} /></button>
                                    {showTerminal ? <ArrowDown size={12} className="text-gray-400" /> : <ArrowUp size={12} className="text-gray-400" />}
                                </div>
                            </div>
                            {showTerminal && (
                                <div ref={terminalRef} className="flex-1 overflow-auto p-2 font-mono text-[11px] bg-black text-green-400 custom-scrollbar">
                                    {commandLogs.length === 0 && <div className="opacity-50 italic">No commands executed yet...</div>}
                                    {commandLogs.map((log, i) => (
                                        <div key={i} className="mb-1">{log}</div>
                                    ))}
                                    <div className="animate-pulse">_</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <GitBranch size={48} className="mb-4 opacity-30" />
                    <p className="text-sm font-medium">No repository connected</p>
                </div>
            )}

            {/* Styles */}
            <style>{`
        .diagonal-stripes {
          background-image: linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent);
          background-size: 8px 8px;
        }
        .dark .diagonal-stripes {
          background-image: linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.8); }
      `}</style>
        </div>
    );
};

// --- Sub-components ---

const ActionBtn = ({ icon: Icon, label, tooltip, loading, onClick }: any) => (
    <button onClick={onClick} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50 text-xs" title={tooltip || label}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
        {label && <span className="hidden xl:inline">{label}</span>}
    </button>
);

const TabBtn = ({ label, active, onClick }: any) => (
    <button onClick={onClick} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${active ? 'bg-white dark:bg-gray-600 shadow text-nebula-600 dark:text-nebula-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
        {label}
    </button>
);

const FileItem = ({ file, isSelected, onSelect, isStaged, onStage, onUnstage, onDiscard, style }: any) => {
    const getIcon = (status: string) => {
        switch (status) {
            case 'modified': return <span className="text-yellow-500 font-bold text-[10px] w-3.5 text-center">M</span>;
            case 'added': return <span className="text-green-500 font-bold text-[10px] w-3.5 text-center">A</span>;
            case 'deleted': return <span className="text-red-500 font-bold text-[10px] w-3.5 text-center">D</span>;
            default: return <FileCode size={12} className="text-gray-400" />;
        }
    };
    return (
        <div onClick={onSelect} className={`group flex items-center gap-2 px-2 py-1 cursor-pointer text-xs transition-colors ${isSelected ? 'bg-nebula-100 dark:bg-nebula-900/30 text-nebula-800 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`} style={style}>
            {getIcon(file.status)}
            <span className="truncate flex-1" title={file.name}>{file.name.split('/').pop()}</span>
            <div className="hidden group-hover:flex items-center gap-1">
                {isStaged !== undefined && (isStaged ? <button onClick={(e) => onUnstage(file.id, e)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500" title="Unstage"><Minus size={12} /></button> : <button onClick={(e) => onStage(file.id, e)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500" title="Stage"><Plus size={12} /></button>)}
                {onDiscard && !isStaged && <button onClick={(e) => onDiscard(file.id, e)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500" title="Discard Changes"><Undo2 size={12} /></button>}
            </div>
        </div>
    );
};

const DiffLineRender = ({ line, side }: { line: GitDiffLine, side: 'left' | 'right' }) => {
    let bgClass = 'bg-transparent';
    let textClass = 'text-gray-600 dark:text-gray-300';
    let numClass = 'text-gray-400 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50';
    if (line.type === 'add' && side === 'right') {
        bgClass = 'bg-green-100/50 dark:bg-green-900/20'; textClass = 'text-green-800 dark:text-green-200'; numClass = 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/20';
    } else if (line.type === 'remove' && side === 'left') {
        bgClass = 'bg-red-100/50 dark:bg-red-900/20'; textClass = 'text-red-800 dark:text-red-200 line-through opacity-70'; numClass = 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20';
    } else if (line.type === 'empty') {
        return <div className="h-5 w-full bg-gray-100/30 dark:bg-gray-800/30 select-none diagonal-stripes">&nbsp;</div>;
    }
    return (
        <div className={`flex h-5 w-fit min-w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${bgClass}`}>
            <div className={`w-10 flex-shrink-0 text-right pr-2 text-[10px] leading-5 select-none border-r ${numClass}`}>{line.num}</div>
            <div className={`pl-3 font-mono text-[11px] leading-5 whitespace-pre ${textClass}`}>{line.text}</div>
        </div>
    );
};

const DiffMinimap = ({ diff, containerRef }: { diff: GitFileStatus, containerRef: React.RefObject<HTMLDivElement> }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const lineCount = diff.rightLines.length;
        if (lineCount === 0) return;
        const width = canvas.width;
        const height = canvas.height;
        const lineHeight = height / lineCount;
        ctx.clearRect(0, 0, width, height);
        diff.rightLines.forEach((line, i) => {
            if (line.type === 'add') { ctx.fillStyle = '#4ade80'; ctx.fillRect(width / 2, i * lineHeight, width / 2, Math.max(1, lineHeight)); }
        });
        diff.leftLines.forEach((line, i) => {
            if (line.type === 'remove') { ctx.fillStyle = '#f87171'; ctx.fillRect(0, i * lineHeight, width / 2, Math.max(1, lineHeight)); }
        });
    }, [diff]);
    const handleClick = (e: React.MouseEvent) => {
        if (!containerRef.current || !diff.rightLines.length) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percentage = y / rect.height;
        const scrollHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = percentage * scrollHeight - (containerRef.current.clientHeight / 2);
    };
    return <canvas ref={canvasRef} width={20} height={600} className="w-full h-full cursor-pointer opacity-70 hover:opacity-100" onClick={handleClick} />;
};

export default GitRepository;
