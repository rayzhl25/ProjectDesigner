
import React from 'react';
import { Heading1, Bold, Italic, List, Link, Image, Code } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const MdPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'H1', icon: Heading1, code: '# ' },
    { label: 'H2', icon: Heading1, code: '## ' },
    { label: 'Bold', icon: Bold, code: '**text**' },
    { label: 'Italic', icon: Italic, code: '*text*' },
    { label: 'List', icon: List, code: '- ' },
    { label: 'Link', icon: Link, code: '[title](url)' },
    { label: 'Image', icon: Image, code: '![alt](url)' },
    { label: 'Code Block', icon: Code, code: '```javascript\n\n```' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-gray-500 mr-2 flex-shrink-0">MD Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-transparent transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
