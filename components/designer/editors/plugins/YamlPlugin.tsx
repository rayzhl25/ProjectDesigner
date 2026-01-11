
import React from 'react';
import { List, AlignLeft, Hash } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const YamlPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Key-Value', icon: AlignLeft, code: 'key: value' },
    { label: 'List Item', icon: List, code: '- item' },
    { label: 'Object', icon: AlignLeft, code: 'parent:\n  child: value' },
    { label: 'Comment', icon: Hash, code: '# Comment' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-purple-500 mr-2 flex-shrink-0">YAML Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
