
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Eraser, Filter, Terminal, AlertCircle, 
  ChevronRight, Bug, FileText, Ban, LayoutList,
  Search, MoreHorizontal, Maximize2, Copy,
  CheckCircle2, AlertTriangle, Info,
  ChevronDown, Plus, Trash2, Split, Check
} from 'lucide-react';
import { Language } from '../../types';

interface DebugConsoleProps {
  lang: Language;
  height: number;
  onClose: () => void;
  onResizeStart: () => void;
}

interface LogEntry {
    id: string;
    type: 'in' | 'out' | 'err' | 'info' | 'warn';
    content: string;
    timestamp: string;
}

interface TerminalSession {
    id: string;
    name: string;
    icon?: any;
    content: string[];
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ lang, height, onClose, onResizeStart }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'problems' | 'output' | 'debug' | 'terminal'>('terminal');
  const [filterText, setFilterText] = useState('');
  
  // -- Console / Debug State --
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([
      { id: 'log_1', type: 'info', content: '[HMR] Waiting for update signal from WDS...', timestamp: new Date().toLocaleTimeString() },
      { id: 'log_2', type: 'info', content: '[WDS] Hot Module Replacement enabled.', timestamp: new Date().toLocaleTimeString() },
      { id: 'log_3', type: 'warn', content: '[ESLint] Warning: Unused variable "x" in src/App.tsx', timestamp: new Date().toLocaleTimeString() },
      { id: 'log_4', type: 'err', content: 'Uncaught ReferenceError: process is not defined', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [consoleInput, setConsoleInput] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState({
      error: true,
      warn: true,
      info: true
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // -- Terminal State --
  const initialTerminalLines = [
      '   \x1b[32mVITE\x1b[0m v6.4.1  \x1b[32mready in 478 ms\x1b[0m',
      '',
      '  \x1b[32m➜\x1b[0m  \x1b[1mLocal\x1b[0m:   \x1b[36mhttp://localhost:3000/\x1b[0m',
      '  \x1b[32m➜\x1b[0m  \x1b[1mNetwork\x1b[0m: \x1b[36mhttp://192.168.10.5:3000/\x1b[0m',
      '  \x1b[32m➜\x1b[0m  press \x1b[1mh + enter\x1b[0m to show help',
      ''
  ];

  const [terminals, setTerminals] = useState<TerminalSession[]>([
      { id: 't1', name: 'zsh', content: initialTerminalLines },
      { id: 't2', name: 'JavaScript Debug Terminal', content: ['Debugger attached.', 'Waiting for localhost...'] }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('t1');

  // -- Effects --
  useEffect(() => {
      if (activeTab === 'debug' || activeTab === 'console') {
          consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [consoleLogs, activeTab, logLevelFilter]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
              setShowFilterMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -- Handlers --

  const handleConsoleSubmit = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && consoleInput.trim()) {
          const cmd = consoleInput.trim();
          const timestamp = new Date().toLocaleTimeString();
          
          setConsoleLogs(prev => [...prev, { id: `log_${Date.now()}_in`, type: 'in', content: cmd, timestamp }]);
          setConsoleInput('');

          // Mock Evaluation
          setTimeout(() => {
              if (cmd === 'clear') {
                  setConsoleLogs([]);
              } else if (cmd.startsWith('print')) {
                  const output = cmd.replace(/^print\s*\(/, '').replace(/\)$/, '').replace(/['"]/g, '');
                  setConsoleLogs(prev => [...prev, { id: `log_${Date.now()}_out`, type: 'out', content: output || 'undefined', timestamp }]);
              } else {
                  setConsoleLogs(prev => [...prev, { id: `log_${Date.now()}_err`, type: 'err', content: `ReferenceError: ${cmd} is not defined`, timestamp }]);
              }
          }, 50);
      }
  };

  const handleClear = () => {
      if (activeTab === 'terminal') {
          // Clear active terminal
          setTerminals(prev => prev.map(t => t.id === activeTerminalId ? { ...t, content: [] } : t));
      } else {
          setConsoleLogs([]);
      }
  };

  const handleAddTerminal = () => {
      const newId = `t${Date.now()}`;
      setTerminals(prev => [...prev, { id: newId, name: 'zsh', content: ['Welcome to new shell'] }]);
      setActiveTerminalId(newId);
  };

  const handleDeleteTerminal = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newTerminals = terminals.filter(t => t.id !== id);
      setTerminals(newTerminals);
      if (activeTerminalId === id && newTerminals.length > 0) {
          setActiveTerminalId(newTerminals[newTerminals.length - 1].id);
      }
  };

  // -- Render Helpers --

  const renderTab = (id: typeof activeTab, label: string, count?: number) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`
            px-3 h-full text-xs uppercase tracking-wide font-medium flex items-center gap-2 border-t-2 transition-colors relative top-[-1px]
            ${activeTab === id 
               ? 'text-gray-900 dark:text-gray-100 border-nebula-500 bg-white dark:bg-[#1e1e1e]' 
               : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }
         `}
      >
         {label}
         {count !== undefined && count > 0 && (
            <span className="bg-nebula-500 text-white text-[10px] px-1.5 rounded-full min-w-[1.2em] text-center">{count}</span>
         )}
      </button>
  );

  const getFilteredLogs = () => {
      return consoleLogs.filter(l => {
          // Text Filter
          if (filterText && !l.content.toLowerCase().includes(filterText.toLowerCase())) return false;
          // Level Filter
          if (l.type === 'err' && !logLevelFilter.error) return false;
          if (l.type === 'warn' && !logLevelFilter.warn) return false;
          if ((l.type === 'info' || l.type === 'out' || l.type === 'in') && !logLevelFilter.info) return false;
          return true;
      });
  };

  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];

  const renderContent = () => {
      switch (activeTab) {
          case 'problems':
              return (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full select-none">
                      <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span>No problems have been detected in the workspace.</span>
                      </div>
                  </div>
              );
          case 'output':
              return (
                  <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1e1e1e]">
                          <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Task:</span>
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-0.5 rounded">
                                  General Output <ChevronDown size={10} />
                              </div>
                          </div>
                      </div>
                      <div className="flex-1 p-2 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto">
                          [10:23:45] Starting compilation...<br/>
                          [10:23:46] Compiling src/main.tsx...<br/>
                          [10:23:47] Done in 1.45s.
                      </div>
                  </div>
              );
          case 'terminal':
              return (
                  <div className="flex h-full">
                      {/* Terminal Output */}
                      <div className="flex-1 p-3 font-mono text-xs text-gray-800 dark:text-gray-300 overflow-y-auto bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-700" style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}>
                          {activeTerminal ? activeTerminal.content.map((line, i) => (
                              <div key={i} className="whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ 
                                  __html: line
                                      .replace(/\x1b\[32m/g, '<span class="text-green-500">')
                                      .replace(/\x1b\[36m/g, '<span class="text-cyan-500">')
                                      .replace(/\x1b\[1m/g, '<span class="font-bold">')
                                      .replace(/\x1b\[0m/g, '</span>') 
                              }} />
                          )) : <div className="text-gray-500">No active terminal</div>}
                          {activeTerminal && (
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-green-500 font-bold">➜</span>
                                  <span className="text-cyan-500 font-bold">~</span>
                                  <span className="w-2 h-4 bg-gray-500 dark:bg-gray-400 animate-pulse block"></span>
                              </div>
                          )}
                      </div>
                      
                      {/* Terminal List Sidebar */}
                      <div className="w-48 bg-gray-50 dark:bg-[#252526] flex flex-col">
                          <div className="p-2 flex items-center justify-between text-xs text-gray-500 uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                              <span>Terminals</span>
                              <button onClick={handleAddTerminal} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                  <Plus size={12} />
                              </button>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                              {terminals.map(t => (
                                  <div 
                                    key={t.id}
                                    onClick={() => setActiveTerminalId(t.id)}
                                    className={`group flex items-center justify-between px-3 py-2 cursor-pointer text-xs ${
                                        activeTerminalId === t.id 
                                        ? 'bg-white dark:bg-[#1e1e1e] text-nebula-600 dark:text-white font-medium border-l-2 border-nebula-600' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-l-2 border-transparent'
                                    }`}
                                  >
                                      <div className="flex items-center gap-2 truncate">
                                          <Terminal size={12} />
                                          <span className="truncate">{t.name}</span>
                                      </div>
                                      <button 
                                        onClick={(e) => handleDeleteTerminal(t.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                                      >
                                          <Trash2 size={10} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              );
          case 'debug':
          case 'console':
          default:
              return (
                  <>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5 custom-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                        {getFilteredLogs().length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 select-none">
                                <AlertCircle size={24} className="mb-2 opacity-20" />
                                <p>当前无控制台日志</p>
                            </div>
                        ) : getFilteredLogs().map((log) => (
                            <div key={log.id} className="flex gap-2 group border-b border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 py-0.5 px-1">
                                <div className={`flex-1 break-all whitespace-pre-wrap flex gap-2 ${
                                    log.type === 'in' ? 'text-gray-500 dark:text-gray-400 font-bold' :
                                    log.type === 'err' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10' :
                                    log.type === 'warn' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10' :
                                    log.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                                    'text-gray-800 dark:text-gray-300'
                                }`}>
                                    {log.type === 'in' && <ChevronRight size={12} className="text-nebula-500 flex-shrink-0 mt-0.5" />}
                                    {log.type === 'err' && <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />}
                                    {log.type === 'warn' && <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />}
                                    <span className="leading-tight">{log.content}</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-600 select-none w-16 flex-shrink-0 text-[10px] opacity-0 group-hover:opacity-100 text-right">
                                    {log.id.split('_')[1] ? 'main.tsx:12' : log.timestamp}
                                </span>
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                    {/* Input Area */}
                    <div className="min-h-[32px] border-t border-gray-200 dark:border-gray-700 flex items-center px-2 gap-2 text-xs font-mono bg-white dark:bg-[#1e1e1e]">
                        <ChevronRight size={14} className="text-nebula-500 flex-shrink-0" />
                        <input 
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        onKeyDown={handleConsoleSubmit}
                        placeholder={activeTab === 'debug' ? "Evaluate expression" : "Type command..."}
                        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 h-full py-2"
                        autoFocus
                        />
                    </div>
                  </>
              );
      }
  };

  return (
    <div 
       className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] flex flex-col relative flex-shrink-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
       style={{ height }}
    >
       {/* Resize Handle */}
       <div 
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-nebula-500 z-40 transition-colors bg-transparent"
          onMouseDown={onResizeStart}
       />

       {/* Toolbar */}
       <div className="flex items-center justify-between px-4 h-9 bg-gray-100 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-700 select-none">
          <div className="flex h-full gap-1">
             {renderTab('console', '控制台日志')}
             {renderTab('problems', '问题', 0)}
             {renderTab('output', '输出')}
             {renderTab('debug', '调试控制台')}
             {renderTab('terminal', '终端')}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex items-center gap-1">
                <input 
                  type="text" 
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="筛选器 (例如 text, !exclude)" 
                  className="w-48 px-2 py-0.5 text-[11px] bg-white dark:bg-[#3c3c3c] border border-gray-200 dark:border-transparent rounded-l outline-none text-gray-700 dark:text-gray-200 focus:border-nebula-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`p-0.5 h-full bg-white dark:bg-[#3c3c3c] border border-l-0 border-gray-200 dark:border-transparent rounded-r hover:bg-gray-100 dark:hover:bg-[#4c4c4c] ${showFilterMenu ? 'bg-gray-100 dark:bg-[#4c4c4c]' : ''}`}
                >
                    <Filter size={12} className="text-gray-500 dark:text-gray-300" />
                </button>

                {/* Filter Menu Popup */}
                {showFilterMenu && (
                    <div ref={filterMenuRef} className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#252526] border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 py-1">
                        <div className="px-3 py-1 text-[10px] uppercase text-gray-500 font-bold mb-1">日志类型</div>
                        <label className="flex items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer gap-2">
                            <input type="checkbox" checked={logLevelFilter.error} onChange={(e) => setLogLevelFilter({...logLevelFilter, error: e.target.checked})} className="rounded text-nebula-600 focus:ring-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">错误</span>
                        </label>
                        <label className="flex items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer gap-2">
                            <input type="checkbox" checked={logLevelFilter.warn} onChange={(e) => setLogLevelFilter({...logLevelFilter, warn: e.target.checked})} className="rounded text-nebula-600 focus:ring-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">警告</span>
                        </label>
                        <label className="flex items-center px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer gap-2">
                            <input type="checkbox" checked={logLevelFilter.info} onChange={(e) => setLogLevelFilter({...logLevelFilter, info: e.target.checked})} className="rounded text-nebula-600 focus:ring-0" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">信息</span>
                        </label>
                    </div>
                )}
             </div>
             <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
             <button onClick={handleClear} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" title="Clear">
                <Eraser size={14} />
             </button>
             <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400" title="Close Panel">
                <X size={14} />
             </button>
          </div>
       </div>

       {/* Panel Content */}
       <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-[#1e1e1e]">
           {renderContent()}
       </div>
    </div>
  );
};

export default DebugConsole;
