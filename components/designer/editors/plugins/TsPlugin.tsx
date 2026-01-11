
import React from 'react';
import { FileType2, Braces, Code2, Shield } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const TsEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Interface', icon: Braces, code: 'interface Name {\n  id: string;\n  name: string;\n}' },
    { label: 'Type', icon: FileType2, code: 'type Name = {\n  key: value;\n};' },
    { label: 'Enum', icon: Code2, code: 'enum Status {\n  Active = "ACTIVE",\n  Inactive = "INACTIVE"\n}' },
    { label: 'Generic Func', icon: Code2, code: 'const func = <T,>(arg: T): T => {\n  return arg;\n};' },
    { label: 'As Const', icon: Shield, code: 'as const' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-blue-500 mr-2 flex-shrink-0">TS Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
