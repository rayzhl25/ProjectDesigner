
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh' | 'en';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface Tenant {
  id: string;
  name: string;
  logo: string;
}

export interface MenuItem {
  id: string;
  icon: any; // LucideIcon
  labelKey: string;
  children?: MenuItem[];
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Department {
  id: string;
  parentId?: string | null;
  name: string;
  code: string;
  manager: string;
  memberCount: number;
  status: 'Active' | 'Inactive';
  description: string;
  children?: Department[];
}

export interface Developer {
  id: string;
  name: string;
  phone: string;
  position: string;
  role: string;
  departmentId: string;
  gender: 'Male' | 'Female';
  avatar: string;
  birthday: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  remarks?: string;
}

export interface Permission {
  id: string;
  module: string; // e.g., 'Projects', 'System'
  action: string; // e.g., 'read', 'write'
  labelKey: string; // Translation key
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
  permissionIds: string[];
  userCount: number;
}

export type ResourceType = 
  | 'page_template' 
  | 'biz_component' 
  | 'vue_component' 
  | 'pro_component' 
  | 'function'
  | 'script' 
  | 'service' 
  | 'api' 
  | 'sql';

export interface Resource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  group: string; // Grouping category
  appType?: 'Web' | 'App' | 'Backend'; // New field
  previewUrl?: string; // Optional for frontend items
  description: string;
  author: string;
  updatedAt: string;
}

export interface SystemInfo {
  productName: string;
  version: string;
  edition: string;
  serviceValidUntil: string;
  licenseValidUntil: string;
  copyright: string;
}

// --- Git Related Types ---

export interface GitDiffLine {
    num: number | null;
    text: string;
    type: 'normal' | 'add' | 'remove' | 'empty';
}

export interface GitFileStatus {
    id: string;
    name: string; // Full path
    status: 'modified' | 'added' | 'deleted';
    leftLines: GitDiffLine[];
    rightLines: GitDiffLine[];
}

export interface GitCommit {
    id: string;
    message: string;
    author: string;
    date: string;
    branch: string;
    files: GitFileStatus[]; // Files changed in this commit
}

// --- File System Types ---

export type FileType = 
  | 'frontend' 
  | 'backend' 
  | 'database' 
  | 'externalSys' 
  | 'externalApi' 
  | 'folder' 
  | 'settings' 
  | 'git_repo' 
  | 'file'
  | 'dbConnection'
  | 'dbGroup'
  | 'dbTable'
  | 'dbView'
  | 'dbFunc'
  | 'dbProc'
  | 'dbTrigger'
  | 'dbQuery';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  children?: FileSystemItem[];
  isOpen?: boolean;
  lastModified?: string;
  parentId?: string | null; // Added for easier flat-to-tree manipulation
}
