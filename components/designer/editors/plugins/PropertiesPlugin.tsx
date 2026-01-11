
import React from 'react';
import { Settings, Hash, AlignLeft } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const PropertiesPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Prop', icon: Settings, code: 'key=value' },
    { label: 'Comment', icon: Hash, code: '# Comment' },
    { label: 'Section', icon: AlignLeft, code: '[Section]' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-indigo-500 mr-2 flex-shrink-0">Config Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
