
import React from 'react';
import { Code2, Braces, AlignCenter } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const XmlPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Tag', icon: Code2, code: '<tag>\n</tag>' },
    { label: 'Self Closing', icon: Code2, code: '<tag />' },
    { label: 'Attribute', icon: AlignCenter, code: 'attr="value"' },
    { label: 'Comment', icon: Braces, code: '<!-- comment -->' },
    { label: 'CDATA', icon: Braces, code: '<![CDATA[ data ]]>' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-orange-600 mr-2 flex-shrink-0">XML Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-orange-200 dark:hover:border-orange-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
