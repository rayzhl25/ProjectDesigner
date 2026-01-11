
import React from 'react';
import { Terminal, Box, FunctionSquare, ArrowRight, BookOpen } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const PyPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'def', icon: FunctionSquare, code: 'def function_name(args):\n    pass' },
    { label: 'class', icon: Box, code: 'class ClassName:\n    def __init__(self):\n        pass' },
    { label: 'if/else', icon: ArrowRight, code: 'if condition:\n    pass\nelse:\n    pass' },
    { label: 'import', icon: BookOpen, code: 'import os\nfrom datetime import datetime' },
    { label: 'print', icon: Terminal, code: 'print("Hello World")' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-blue-500 mr-2 flex-shrink-0">Python Tools</span>
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
