import { GitCommit, GitFileStatus, FileSystemItem } from '../types';

// --- File System / Project Designer ---

const mockFiles: Record<string, FileSystemItem[]> = {
    pages: [
        { id: 'p1', name: 'Home', type: 'folder', children: [{ id: 'p1_1', name: 'index.tsx', type: 'frontend' }, { id: 'p1_2', name: 'style.css', type: 'file' }] },
        { id: 'p2', name: 'Login', type: 'folder', children: [{ id: 'p2_1', name: 'Login.tsx', type: 'frontend' }] }
    ],
    apps: [
        { id: 'a1', name: 'MobileMain', type: 'folder', children: [{ id: 'a1_1', name: 'App.tsx', type: 'frontend' }] }
    ],
    apis: [
        { id: 'api1', name: 'User', type: 'folder', children: [{ id: 'api1_1', name: 'getUser', type: 'backend' }, { id: 'api1_2', name: 'updateUser', type: 'backend' }] }
    ],
    models: [
        // Initial Mock Database Connection
        {
            id: 'db_main',
            name: 'Main Database',
            type: 'dbConnection', // Special type for DB root
            children: [
                { id: 'db_main_tables', name: 'Tables', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_views', name: 'Views', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_funcs', name: 'Functions', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_procs', name: 'Procedures', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_trigs', name: 'Triggers', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_queries', name: 'Queries', type: 'dbGroup', children: [], parentId: 'db_main' },
            ]
        }
    ],
    external: [
        { id: 'ext1', name: 'ERP System', type: 'externalSys', children: [{ id: 'ext1_1', name: 'SyncOrder', type: 'externalApi' }] }
    ]
};

export const fetchProjectFiles = async (projectId: string, type: string): Promise<FileSystemItem[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockFiles[type] || []), 400));
};

// Lazy loading for Database items
export const fetchChildNodes = async (parentId: string, type: string): Promise<FileSystemItem[]> => {
    console.log(`[Mock] Loading children for ${parentId} of type ${type}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (parentId.endsWith('_tables')) {
                resolve([
                    { id: `${parentId}_1`, name: 'sys_users', type: 'dbTable', parentId },
                    { id: `${parentId}_2`, name: 'sys_roles', type: 'dbTable', parentId },
                    { id: `${parentId}_3`, name: 'biz_orders', type: 'dbTable', parentId },
                ]);
            } else if (parentId.endsWith('_views')) {
                resolve([
                    { id: `${parentId}_1`, name: 'v_user_stats', type: 'dbView', parentId },
                ]);
            } else if (parentId.endsWith('_funcs')) {
                resolve([
                    { id: `${parentId}_1`, name: 'fn_get_org_path', type: 'dbFunc', parentId },
                ]);
            } else {
                resolve([]);
            }
        }, 600);
    });
};

// Helper to recursively find a node by ID
const findNode = (items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
            const found = findNode(item.children, id);
            if (found) return found;
        }
    }
    return null;
};

// Helper to find the parent array containing a node (for removal/updates)
const findParentArray = (items: FileSystemItem[], childId: string): FileSystemItem[] | null => {
    // Check if the node is at this level
    if (items.some(item => item.id === childId)) return items;

    // Check children recursively
    for (const item of items) {
        if (item.children) {
            const found = findParentArray(item.children, childId);
            if (found) return found;
        }
    }
    return null;
};

export const createNode = async (projectId: string, rootType: string, parentId: string | null, data: any): Promise<FileSystemItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newId = `node_${Date.now()}`;
            let newNode: FileSystemItem;

            // Special handling for creating a new Database Connection
            if (rootType === 'models' && (!parentId || parentId === '')) {
                const dbChildren: FileSystemItem[] = [
                    { id: `${newId}_tables`, name: 'Tables', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_views`, name: 'Views', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_funcs`, name: 'Functions', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_procs`, name: 'Procedures', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_trigs`, name: 'Triggers', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_queries`, name: 'Queries', type: 'dbGroup', children: [], parentId: newId },
                ];

                newNode = {
                    id: newId,
                    name: data.name,
                    type: 'dbConnection', // Force type for root models
                    children: dbChildren
                };
            } else {
                // Normal creation
                newNode = {
                    id: newId,
                    name: data.name,
                    type: data.type,
                    children: data.type === 'folder' ? [] : undefined // Folders get empty children array
                };
            }

            // Insert into mockFiles
            const rootFiles = mockFiles[rootType] || [];
            if (!parentId) {
                rootFiles.push(newNode);
                mockFiles[rootType] = rootFiles;
            } else {
                const parent = findNode(rootFiles, parentId);
                if (parent) {
                    if (!parent.children) parent.children = [];
                    parent.children.push(newNode);
                } else {
                    // Fallback to root if parent not found (shouldn't happen usually)
                    rootFiles.push(newNode);
                }
            }

            resolve(newNode);
        }, 500);
    });
};

export const updateNode = async (projectId: string, nodeId: string, data: any): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            Object.keys(mockFiles).forEach(key => {
                const node = findNode(mockFiles[key], nodeId);
                if (node) {
                    if (data.name) node.name = data.name;
                    // Copy other props if needed
                }
            });
            resolve();
        }, 400);
    });
};

export const deleteNode = async (projectId: string, nodeId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            Object.keys(mockFiles).forEach(key => {
                const rootList = mockFiles[key];
                const parentEx = findParentArray(rootList, nodeId);
                if (parentEx) {
                    const idx = parentEx.findIndex(n => n.id === nodeId);
                    if (idx !== -1) {
                        parentEx.splice(idx, 1);
                    }
                }
            });
            resolve();
        }, 400);
    });
};

export const moveNode = async (projectId: string, draggedId: string, targetId: string, rootType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const rootList = mockFiles[rootType];
            if (!rootList) {
                reject("Root type not found");
                return;
            }

            // 1. Find and Remove Dragged Node
            const sourceParentArray = findParentArray(rootList, draggedId);
            if (!sourceParentArray) {
                reject("Dragged node not found");
                return;
            }
            const draggedIndex = sourceParentArray.findIndex(n => n.id === draggedId);
            if (draggedIndex === -1) {
                reject("Dragged node not found in parent");
                return;
            }
            const [draggedNode] = sourceParentArray.splice(draggedIndex, 1);

            // 2. Find Target Node
            const targetNode = findNode(rootList, targetId);
            if (targetNode) {
                // If target is a folder-like item, add to its children
                if (targetNode.children) {
                    targetNode.children.push(draggedNode);
                    if (!targetNode.isOpen) targetNode.isOpen = true; // Auto-expand
                } else {
                    // If target is a file, we can optionally move to the same parent as target (sibling)
                    // But the requirement says "drag to new directory", so maybe we should limit to folders.
                    // However, standard UX often allows reordering. Here we'll just append to the *target's parent*.
                    const targetParentArray = findParentArray(rootList, targetId);
                    if (targetParentArray) {
                        // Insert after target or at end? Let's just push for now or check index
                        // Simplicity: pushing to the parent of the target file
                        targetParentArray.push(draggedNode);
                    } else {
                        // Fallback: put back to source
                        sourceParentArray.push(draggedNode);
                    }
                }
            } else {
                // Target not found? Put back.
                sourceParentArray.push(draggedNode);
            }

            resolve();
        }, 400);
    });
};

export const copyNode = async (projectId: string, nodeId: string): Promise<FileSystemItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Very basic shallow copy mock
            Object.keys(mockFiles).forEach(key => {
                const list = mockFiles[key];
                const original = findNode(list, nodeId);
                if (original) {
                    const parentArr = findParentArray(list, nodeId);
                    if (parentArr) {
                        const copy: FileSystemItem = {
                            ...original,
                            id: `copy_${original.id}_${Date.now()}`,
                            name: `${original.name} (Copy)`,
                            children: original.children ? [] : undefined // Don't deep copy children for now
                        };
                        parentArr.push(copy);
                        resolve(copy);
                        return;
                    }
                }
            });
            // If not found
            resolve({ id: 'err', name: 'Error', type: 'file' });
        }, 500);
    });
};

// --- Git ---

export const fetchGitChanges = async (): Promise<GitFileStatus[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
        { id: 'f1', name: 'src/components/Header.tsx', status: 'modified', leftLines: [], rightLines: [] },
        { id: 'f2', name: 'src/utils/api.ts', status: 'modified', leftLines: [], rightLines: [] },
        { id: 'f3', name: 'public/logo.svg', status: 'added', leftLines: [], rightLines: [] }
    ]), 800));
};

export const fetchGitHistory = async (): Promise<GitCommit[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
        { id: 'c1', message: 'feat: add user login', author: 'Dev1', date: '2023-10-25', branch: 'main', files: [] },
        { id: 'c2', message: 'fix: button style', author: 'Dev2', date: '2023-10-24', branch: 'main', files: [] }
    ]), 800));
};

export const performGitAction = async (action: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1500));
};

// --- System Interface Config ---

export const saveSystemConfig = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const saveApiConfig = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

// --- Database Config ---

export const saveDatabaseConfig = async (data: any): Promise<void> => {
    console.log("Saving DB Config:", data);
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const testDatabaseConnection = async (data: any): Promise<boolean> => {
    console.log("Testing DB Config:", data);
    return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
};

// --- New Debug API Service ---
export const debugApi = async (params: any): Promise<any> => {
    console.log("Calling Backend API [DEBUG] with params:", params);
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock Response based on simple logic
            const isError = params.url?.includes('error');

            if (isError) {
                resolve({
                    success: false,
                    code: 500,
                    error: {
                        message: "Internal Server Error",
                        trace: "java.lang.NullPointerException at com.nebula.api.Controller..."
                    },
                    timestamp: Date.now()
                });
            } else {
                resolve({
                    success: true,
                    code: 200,
                    message: "Operation successful",
                    data: {
                        id: 12345,
                        name: "Mock Entity",
                        status: "active",
                        tags: ["test", "demo"],
                        details: {
                            created_at: "2023-10-27T10:00:00Z",
                            updated_at: "2023-10-28T14:30:00Z",
                            meta: {
                                version: 1,
                                author: "admin"
                            }
                        },
                        receivedParams: {
                            queryParams: params.queryParams,
                            pathParams: params.pathParams,
                            body: params.body ? (typeof params.body === 'string' ? JSON.parse(params.body || '{}') : params.body) : null
                        }
                    },
                    timestamp: Date.now()
                });
            }
        }, 800); // Simulate network delay
    });
};
