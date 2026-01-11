export interface ColumnDefinition {
    id: string;
    name: string;
    label: string;
    type: string;
    length: string;
    pk: boolean;
    nn: boolean; // Not Null
    ai: boolean; // Auto Increment
    default: string;
    comment: string;
    required: boolean;
    showInTable: boolean;
    showInForm: boolean;
    showInDetail: boolean;
    queryType: 'none' | 'eq' | 'like' | 'gt' | 'lt' | 'between';
    componentType: 'Input' | 'Textarea' | 'Select' | 'Switch' | 'DatePicker' | 'DateTimePicker' | 'Upload' | 'NumberInput';
    componentProps: string; // JSON string
}

export type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;
export type Filters = { [key: string]: string };
