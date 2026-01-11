
import React from 'react';
import { Database, Search, Plus, Trash2, ArrowRight } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const SqlPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'SELECT', icon: Search, code: 'SELECT * FROM table_name WHERE condition;' },
    { label: 'INSERT', icon: Plus, code: 'INSERT INTO table_name (col1, col2) VALUES (val1, val2);' },
    { label: 'UPDATE', icon: ArrowRight, code: 'UPDATE table_name SET col1 = val1 WHERE condition;' },
    { label: 'DELETE', icon: Trash2, code: 'DELETE FROM table_name WHERE condition;' },
    { label: 'CREATE TABLE', icon: Database, code: 'CREATE TABLE table_name (\n    id INT PRIMARY KEY,\n    name VARCHAR(255)\n);' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-amber-500 mr-2 flex-shrink-0">SQL Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
