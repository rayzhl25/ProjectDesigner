
import React from 'react';
import { 
  Coffee,
  Box,
  Terminal,
  Play,
  FileCode2,
  Database
} from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const JavaEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Main Class', icon: FileCode2, code: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}' },
    { label: 'Print', icon: Terminal, code: 'System.out.println("");' },
    { label: 'For Loop', icon: Box, code: 'for (int i = 0; i < length; i++) {\n    \n}' },
    { label: 'If/Else', icon: Box, code: 'if (condition) {\n    \n} else {\n    \n}' },
    { label: 'Method', icon: Play, code: 'public void methodName() {\n    \n}' },
    { label: 'Entity', icon: Database, code: '@Entity\n@Table(name = "table_name")\npublic class EntityName {\n    @Id\n    @GeneratedValue\n    private Long id;\n}' },
    { label: 'Service', icon: Coffee, code: '@Service\npublic class UserService {\n    \n}' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-red-500 mr-2 flex-shrink-0">Java Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
