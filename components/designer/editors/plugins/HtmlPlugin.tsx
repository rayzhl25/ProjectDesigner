
import React from 'react';
import { Box, Type, Image, Link as LinkIcon, Table, Layout, Code2 } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

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
