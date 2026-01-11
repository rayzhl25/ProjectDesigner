
import React from 'react';
import { Layout, Columns, Palette, Box, AlignLeft, Component } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const CssEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Flex Center', icon: Layout, code: 'display: flex;\njustify-content: center;\nalign-items: center;' },
    { label: 'Grid Basic', icon: Columns, code: 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;' },
    { label: 'Color Var', icon: Palette, code: 'color: var(--primary-color);' },
    { label: 'Media Query', icon: Box, code: '@media (max-width: 768px) {\n  \n}' },
    { label: 'Reset', icon: AlignLeft, code: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}' },
    { label: 'Hover', icon: Component, code: '&:hover {\n  opacity: 0.8;\n}' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-blue-500 mr-2 flex-shrink-0">CSS Tools</span>
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
