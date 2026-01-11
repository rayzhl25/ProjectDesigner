
import React from 'react';
import { Component, Braces, Zap, Code2 } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const TsxEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'FC', icon: Component, code: 'export const Component: React.FC<Props> = ({ prop }) => {\n  return <div></div>;\n};' },
    { label: 'useState', icon: Zap, code: 'const [state, setState] = useState(initial);' },
    { label: 'useEffect', icon: Zap, code: 'useEffect(() => {\n  \n}, []);' },
    { label: 'Fragment', icon: Code2, code: '<>\n  \n</>' },
    { label: 'ClassName', icon: Braces, code: 'className=""' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-sky-500 mr-2 flex-shrink-0">React Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-sky-200 dark:hover:border-sky-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
