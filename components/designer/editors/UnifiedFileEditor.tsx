
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Eye, Code2, MoreVertical, 
  Search, CornerDownLeft, Image as ImageIcon
} from 'lucide-react';
import { getEditorConfig } from './EditorRegistry';
// Import all plugins
import { HtmlEditorPlugin } from './plugins/HtmlPlugin';
import { CssEditorPlugin } from './plugins/CssPlugin';
import { JsEditorPlugin } from './plugins/JsPlugin';
import { JavaEditorPlugin } from './plugins/JavaPlugin';
import { VueEditorPlugin } from './plugins/VuePlugin';
import { TsEditorPlugin } from './plugins/TsPlugin';
import { TsxEditorPlugin } from './plugins/TsxPlugin';
import { JsxPlugin } from './plugins/JsxPlugin';
import { JsonPlugin } from './plugins/JsonPlugin';
import { YamlPlugin } from './plugins/YamlPlugin';
import { MdPlugin } from './plugins/MdPlugin';
import { PropertiesPlugin } from './plugins/PropertiesPlugin';
import { XmlPlugin } from './plugins/XmlPlugin';
import { TxtPlugin } from './plugins/TxtPlugin';
import { SqlPlugin } from './plugins/SqlPlugin';
import { PyPlugin } from './plugins/PyPlugin';
// New Components
import MonacoEditor from './MonacoEditor';
import { ImageEditorPlugin } from './plugins/ImageEditorPlugin';

interface UnifiedFileEditorProps {
  file: {
    id: string;
    title: string; // Filename
    content?: string; // Optional initial content
  };
}

const UnifiedFileEditor: React.FC<UnifiedFileEditorProps> = ({ file }) => {
  const config = getEditorConfig(file.title);
  // Initialize content from file prop, fallback to sample
  const [content, setContent] = useState(file.content || config.sampleContent);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>(config.language === 'image' ? 'preview' : 'code');
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Determine if it is an image file
  const isImage = config.language === 'image';

  // Effect: Update content when file changes (Tab Switch)
  useEffect(() => {
      const newConfig = getEditorConfig(file.title);
      setContent(file.content || newConfig.sampleContent);
      if (newConfig.language === 'image') setViewMode('preview');
      else if (viewMode === 'preview' && !newConfig.canPreview) setViewMode('code');
  }, [file.id, file.title, file.content]);

  // Insert text handler for toolbar plugins (simulated for Monaco since it manages its own state usually, 
  // but we can prepend/append or use a ref if we went deeper. For now, simple append for demo or specific position if controlled)
  const insertTextAtCursor = (text: string) => {
      // Note: With Monaco controlled value, direct insertion is tricky without the editor instance ref.
      // For this "Plugin" toolbar feature to work perfectly with Monaco, we'd need to forward the editor instance ref from MonacoEditor.
      // For simplicity in this demo, we simply append to content which triggers a refresh. 
      // In a real production app, use editor.getModel().applyEdits() via a ref.
      setContent(prev => prev + "\n" + text);
  };

  // Mock rendering of preview
  const renderPreview = () => {
    if (isImage) {
      // Use the dedicated Image Editor for "Preview" mode of images
      return (
        <ImageEditorPlugin 
            initialImage={content || undefined} // Pass base64 if available in content (mock)
            onSave={(newImage) => setContent(newImage)}
        />
      );
    }
    if (config.language === 'markdown') {
        return (
            <div className="p-8 prose prose-invert max-w-none bg-white dark:bg-[#1e1e1e] h-full overflow-auto">
                <h1 className="text-2xl font-bold mb-4 border-b pb-2">{content.split('\n')[0].replace('# ', '') || 'Untitled'}</h1>
                <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-sans">
                    {content}
                </div>
            </div>
        )
    }
    if (config.language === 'html') {
        return (
            <div className="bg-white h-full w-full p-4 overflow-auto">
                <div className="border border-gray-200 rounded p-4 shadow-sm text-black">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase">HTML Preview (Mock Sandbox)</h3>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        )
    }
    return <div className="flex items-center justify-center h-full text-gray-500">No Preview Available</div>;
  };

  // Determine which plugin to render based on language
  const renderPluginToolbar = () => {
      // Map editor registry 'language' or specific logic to plugin component
      switch (config.language) {
          case 'html': return <HtmlEditorPlugin onInsert={insertTextAtCursor} />;
          case 'css': return <CssEditorPlugin onInsert={insertTextAtCursor} />;
          case 'javascript': return <JsEditorPlugin onInsert={insertTextAtCursor} />;
          case 'typescript': return <TsEditorPlugin onInsert={insertTextAtCursor} />;
          case 'react': 
              if (file.title.endsWith('.jsx')) return <JsxPlugin onInsert={insertTextAtCursor} />;
              return <TsxEditorPlugin onInsert={insertTextAtCursor} />; 
          case 'vue': return <VueEditorPlugin onInsert={insertTextAtCursor} />;
          case 'java': return <JavaEditorPlugin onInsert={insertTextAtCursor} />;
          case 'json': return <JsonPlugin onInsert={insertTextAtCursor} />;
          case 'yaml': return <YamlPlugin onInsert={insertTextAtCursor} />;
          case 'markdown': return <MdPlugin onInsert={insertTextAtCursor} />;
          case 'properties': return <PropertiesPlugin onInsert={insertTextAtCursor} />;
          case 'xml': return <XmlPlugin onInsert={insertTextAtCursor} />;
          case 'sql': return <SqlPlugin onInsert={insertTextAtCursor} />;
          case 'python': return <PyPlugin onInsert={insertTextAtCursor} />;
          case 'plaintext': return <TxtPlugin onInsert={insertTextAtCursor} />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-[#d4d4d4] font-sans transition-colors duration-300">
      
      {/* 1. Editor Toolbar */}
      {!isImage && (
        <div className="bg-gray-100 dark:bg-[#252526] border-b border-gray-200 dark:border-[#1e1e1e] flex flex-col flex-shrink-0 select-none transition-colors duration-300">
            {/* Top Bar */}
            <div className="h-10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <config.icon size={16} className="text-nebula-600 dark:text-[#4ec9b0]" />
                    <span className="text-sm font-medium italic text-gray-700 dark:text-gray-300">{file.title}</span>
                    {config.canPreview && (
                        <div className="flex bg-gray-200 dark:bg-[#333] rounded ml-4 p-0.5">
                            <button 
                                onClick={() => setViewMode('code')}
                                className={`p-1 rounded ${viewMode === 'code' ? 'bg-white dark:bg-[#1e1e1e] shadow text-nebula-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                title="Code View"
                            >
                                <Code2 size={14} />
                            </button>
                            <button 
                                onClick={() => setViewMode('preview')}
                                className={`p-1 rounded ${viewMode === 'preview' ? 'bg-white dark:bg-[#1e1e1e] shadow text-nebula-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                title="Preview"
                            >
                                <Eye size={14} />
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Search (Ctrl+F)">
                        <Search size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Save (Ctrl+S)">
                        <Save size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-[#333] mx-1"></div>
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>

            {/* Secondary Plugin Toolbar (If available and in code mode) */}
            {viewMode === 'code' && renderPluginToolbar() && (
                <div className="border-t border-gray-200 dark:border-[#1e1e1e] bg-gray-50 dark:bg-[#2d2d2d] px-2 py-1 transition-colors duration-300">
                    {renderPluginToolbar()}
                </div>
            )}
        </div>
      )}

      {/* 2. Main Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
         {viewMode === 'code' && !isImage ? (
             <div className="flex-1 relative bg-white dark:bg-[#1e1e1e]">
                <MonacoEditor 
                    language={config.language}
                    value={content}
                    onChange={(val) => setContent(val || '')}
                />
             </div>
         ) : (
             <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e]">
                 {renderPreview()}
             </div>
         )}
      </div>

      {/* 3. Status Bar */}
      {!isImage && (
        <div className="h-6 bg-nebula-600 dark:bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><CornerDownLeft size={10} /> master*</span>
                <span>0 errors, 0 warnings</span>
            </div>
            <div className="flex items-center gap-4">
                {viewMode === 'code' && <span>Ln {content.split('\n').length}, Col 1</span>}
                <span>UTF-8</span>
                <span>{config.label}</span>
            </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 5px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.8);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
             background: #424242;
             border: 2px solid #1e1e1e;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4f4f4f;
        }
      `}</style>
    </div>
  );
};

export default UnifiedFileEditor;
