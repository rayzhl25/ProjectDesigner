
import React from 'react';
import { Braces, Code2, List } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const JsonPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Object', icon: Braces, code: '{\n  "key": "value"\n}' },
    { label: 'Array', icon: List, code: '[\n  "item1",\n  "item2"\n]' },
    { label: 'Key-Value', icon: Code2, code: '"key": "value",' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-yellow-500 mr-2 flex-shrink-0">JSON Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
