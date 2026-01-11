
import React, { useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

const MONACO_VERSION = '0.45.0';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`;

// Configure Monaco to load from CDN
loader.config({ paths: { vs: `${CDN_BASE}/vs` } });

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ language, value, onChange, readOnly = false }) => {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('light');

  // Sync with system/app theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'vs-dark' : 'light');
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language={language === 'react' ? 'javascript' : language} // Monaco uses javascript for jsx/tsx usually
        value={value}
        theme={theme}
        onChange={onChange}
        loading={
            <div className="flex items-center justify-center h-full w-full text-gray-500 gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Loading Editor...</span>
            </div>
        }
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 13,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          padding: { top: 16 },
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
};

export default MonacoEditor;
