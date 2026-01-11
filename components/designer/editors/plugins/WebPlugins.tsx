
import React from 'react';
import { 
  Code2, 
  Layout, 
  Type, 
  Image, 
  Link as LinkIcon, 
  Table, 
  Palette, 
  Box, 
  Columns, 
  AlignLeft, 
  Play, 
  Terminal, 
  Braces, 
  FunctionSquare,
  Component
} from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
  content?: string;
}

// --- HTML Plugin ---
export const HtmlEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Div', icon: Box, code: '<div>\n  \n</div>' },
    { label: 'Span', icon: Type, code: '<span></span>' },
    { label: 'Image', icon: Image, code: '<img src="" alt="" />' },
    { label: 'Link', icon: LinkIcon, code: '<a href="#">Link</a>' },
    { label: 'Table', icon: Table, code: '<table>\n  <thead>\n    <tr><th>Header</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Data</td></tr>\n  </tbody>\n</table>' },
    { label: 'Form', icon: Layout, code: '<form>\n  <input type="text" />\n  <button>Submit</button>\n</form>' },
    { label: 'Skeleton', icon: Code2, code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-orange-500 mr-2 flex-shrink-0">HTML Tools</span>
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

// --- CSS Plugin ---
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

// --- JS Plugin ---
export const JsEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Log', icon: Terminal, code: 'console.log();' },
    { label: 'Func', icon: FunctionSquare, code: 'const funcName = () => {\n  \n};' },
    { label: 'Import', icon: Code2, code: 'import { } from "";' },
    { label: 'Promise', icon: Braces, code: 'new Promise((resolve, reject) => {\n  \n});' },
    { label: 'Fetch', icon: Play, code: 'fetch("url")\n  .then(res => res.json())\n  .then(data => console.log(data));' },
    { label: 'React Comp', icon: Component, code: 'export const Component = () => {\n  return <div></div>;\n};' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-yellow-500 mr-2 flex-shrink-0">JS Tools</span>
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
