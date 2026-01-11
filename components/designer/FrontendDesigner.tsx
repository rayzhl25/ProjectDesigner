
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Type, Square, MousePointer2, Image as ImageIcon, Calendar, 
  BarChart3, Map, Table as TableIcon, List, FormInput, CheckSquare,
  ChevronDown, ChevronRight, Plus, Trash2, RotateCcw,
  Save, Eye, Globe, Code, History, Database, Settings, MoreHorizontal,
  Copy, Clipboard, Zap, X
} from 'lucide-react';
import { Language } from '../../types';
import { LOCALE } from '../../constants';

interface FrontendDesignerProps {
  file: any; // The file/page being edited
  lang: Language;
}

const FrontendDesigner: React.FC<FrontendDesignerProps> = ({ file, lang }) => {
  const t = LOCALE[lang];
  const [rightTab, setRightTab] = useState('base');

  // Breadcrumb State
  const [breadcrumbs, setBreadcrumbs] = useState(['pages', 'auth', 'login.tsx', 'body', 'div.card', 'Button.primary']);
  const [activeBreadcrumb, setActiveBreadcrumb] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, index: number} | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setActiveBreadcrumb(null);
      setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleBreadcrumbClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    setActiveBreadcrumb(activeBreadcrumb === index ? null : index);
  };

  const handleBreadcrumbContextMenu = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveBreadcrumb(null);
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  const handleSiblingSelect = (index: number, siblingName: string) => {
      const newBreadcrumbs = [...breadcrumbs];
      newBreadcrumbs[index] = siblingName;
      // In a real app, this would also update the path below this index or navigate
      setBreadcrumbs(newBreadcrumbs);
      setActiveBreadcrumb(null);
  };

  const handleContextAction = (action: string) => {
      console.log(`Action ${action} on item index ${contextMenu?.index}`);
      setContextMenu(null);
  };

  // Mock Component Library Data
  const components = [
    { category: '常用', items: [
      { name: '布局容器', icon: Layout }, { name: '文本', icon: Type },
      { name: '图标', icon: Square }, { name: '按钮', icon: MousePointer2 },
      { name: '输入框', icon: FormInput }, { name: '选择器', icon: CheckSquare },
      { name: '日期选择器', icon: Calendar }, { name: '图片', icon: ImageIcon },
      { name: '标签页', icon: Layout }, { name: '日期范围', icon: Calendar },
    ]},
    { category: '图表', items: [
      { name: '表格', icon: TableIcon }, { name: '列表', icon: List },
      { name: '柱状图', icon: BarChart3 }, { name: '折线图', icon: BarChart3 },
      { name: '堆叠面积图', icon: BarChart3 }, { name: '条形图', icon: BarChart3 },
      { name: '漏斗图', icon: BarChart3 }, { name: '环形图', icon: BarChart3 },
      { name: '饼图', icon: BarChart3 }, { name: '玫瑰图', icon: BarChart3 },
      { name: '散点图', icon: BarChart3 }, { name: '瀑布图', icon: BarChart3 },
      { name: '雷达图', icon: BarChart3 }, { name: '甘特图', icon: BarChart3 },
      { name: '高级甘特图', icon: BarChart3 }, { name: '进度条', icon: BarChart3 },
      { name: '高德地图', icon: Map }, { name: '自定义表格', icon: TableIcon },
    ]},
    { category: '输入', items: [
        { name: '多选框', icon: CheckSquare }, { name: '单选框', icon: CheckSquare },
        { name: '级联选择', icon: List }, { name: '表格选择器', icon: TableIcon },
    ]}
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-sm font-sans relative">
      {/* Designer Toolbar */}
      <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-20">
         {/* Breadcrumb Navigation */}
         <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 select-none">
            <span className="mr-2 opacity-70">正在编辑:</span>
            {breadcrumbs.map((item, index) => (
                <div key={index} className="relative flex items-center">
                    {index > 0 && <ChevronRight size={12} className="mx-1 text-gray-400" />}
                    <span 
                        className={`
                            cursor-pointer px-1.5 py-0.5 rounded transition-colors relative
                            ${activeBreadcrumb === index ? 'bg-nebula-100 text-nebula-700 dark:bg-nebula-900/30 dark:text-nebula-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'}
                        `}
                        onClick={(e) => handleBreadcrumbClick(index, e)}
                        onContextMenu={(e) => handleBreadcrumbContextMenu(index, e)}
                    >
                        {item}
                    </span>
                    
                    {/* Sibling Dropdown */}
                    {activeBreadcrumb === index && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-md py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-3 py-1.5 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700 mb-1">
                                同级元素
                            </div>
                            {[`${item}`, `${item}_sibling1`, `${item}_sibling2`].map((sibling, i) => (
                                <button 
                                    key={i}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${sibling === item ? 'text-nebula-600 font-medium bg-nebula-50 dark:bg-nebula-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                                    onClick={() => handleSiblingSelect(index, sibling)}
                                >
                                    {sibling === item && <div className="w-1.5 h-1.5 rounded-full bg-nebula-600"></div>}
                                    {sibling}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
         </div>

         <div className="flex items-center gap-2">
           <ToolbarButton icon={Save} label="保存" />
           <ToolbarButton icon={Eye} label="预览" />
           <ToolbarButton icon={RotateCcw} label="重载" />
           <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1"></div>
           <ToolbarButton icon={Globe} label="全局变量" />
           <ToolbarButton icon={Code} label="源码" />
           <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1"></div>
           <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><MoreHorizontal size={16} /></button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 1. Left Sidebar: Component Library */}
        <div className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
           <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium bg-gray-50 dark:bg-gray-800/50">
              <Layout size={14} /> 组件库
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {components.map((group, idx) => (
                 <div key={idx}>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider cursor-pointer hover:text-nebula-600">
                       {group.category} <ChevronDown size={12} />
                    </div>
                    {/* Components Grid - Left Icon, Right Text Layout */}
                    <div className="grid grid-cols-2 gap-2">
                       {group.items.map((item, i) => (
                          <div 
                            key={i} 
                            className="flex flex-row items-center justify-start px-2 py-2 rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700/30 hover:border-nebula-400 hover:text-nebula-600 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all gap-2"
                            title={item.name}
                          >
                             <item.icon size={16} className="flex-shrink-0" />
                             <span className="truncate text-xs">{item.name}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* 2. Center Canvas */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-6 flex justify-center relative">
           <div className="w-full max-w-5xl bg-white dark:bg-gray-800 shadow-sm min-h-[800px] flex flex-col border border-gray-200 dark:border-gray-700">
              
              {/* Canvas Header / Filter Area */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
                 <div className="flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    <span className="text-gray-600 dark:text-gray-300 w-16">活动单号</span>
                    <input type="text" placeholder="请输入" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-32 outline-none focus:border-nebula-500 bg-transparent" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-300 w-16">活动名称</span>
                    <input type="text" placeholder="请输入" className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-32 outline-none focus:border-nebula-500 bg-transparent" />
                 </div>
                 <div className="flex gap-2 ml-auto">
                    <button className="bg-nebula-500 text-white px-3 py-1 rounded hover:bg-nebula-600 transition-colors text-xs">搜索</button>
                    <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 transition-colors text-xs">重置</button>
                 </div>
              </div>

              {/* Table Section */}
              <div className="p-4">
                 <table className="w-full text-center border-collapse border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs">
                       <tr>
                          <th className="border p-2 font-medium">序号</th>
                          <th className="border p-2 font-medium">活动编号</th>
                          <th className="border p-2 font-medium">优先级</th>
                          <th className="border p-2 font-medium">状态</th>
                          <th className="border p-2 font-medium">操作</th>
                       </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300 text-xs">
                       {[1, 2, 3].map((id) => (
                          <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                             <td className="border p-2">{id}</td>
                             <td className="border p-2">ACT-2023-{100+id}</td>
                             <td className="border p-2">High</td>
                             <td className="border p-2">Active</td>
                             <td className="border p-2 text-nebula-500">
                                <button className="hover:underline mr-2">Edit</button>
                                <button className="hover:underline text-red-500">Delete</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 <div className="flex justify-center items-center mt-4 text-gray-400 text-xs">
                    Pagination Component
                 </div>
              </div>

              {/* Form Section Placeholder */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-auto bg-gray-50/50 dark:bg-gray-900/50">
                 <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                    <Plus size={24} className="mb-2 opacity-50" />
                    <span className="text-xs">Drag components here to add more sections</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 3. Right Sidebar: Properties Panel */}
        <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
           <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              {['base', 'data', 'structure'].map(tab => (
                <button 
                  key={tab}
                  className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize ${rightTab === tab ? 'border-nebula-600 text-nebula-600 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  onClick={() => setRightTab(tab)}
                >
                  {tab === 'base' ? '属性' : tab === 'data' ? '数据' : '结构'}
                </button>
              ))}
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Page Settings */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-gray-600 dark:text-gray-300 text-xs">页面边距</label>
                    <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-32 outline-none bg-transparent">
                       <option>超小(8px)</option>
                    </select>
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-gray-600 dark:text-gray-300 text-xs">背景颜色</label>
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
                       <span className="text-xs text-gray-400">#FFFFFF</span>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <label className="text-gray-600 dark:text-gray-300 text-xs mt-1.5">背景图</label>
                    <div className="flex-1 space-y-2">
                       <div className="h-20 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 border-dashed hover:border-nebula-500 cursor-pointer transition-colors">
                          <Plus size={16} className="text-gray-400" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                 <div className="flex items-center justify-between cursor-pointer mb-3">
                    <span className="text-gray-700 dark:text-gray-200 font-bold text-xs">交互事件</span>
                    <Plus size={14} className="text-nebula-600 cursor-pointer" />
                 </div>
                 <div className="space-y-2">
                    <button className="w-full border border-gray-200 dark:border-gray-700 rounded py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center px-2 gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> OnLoad
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-50 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <button onClick={() => handleContextAction('event')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Zap size={14} className="text-yellow-500"/> 事件
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
            <button onClick={() => handleContextAction('copy')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Copy size={14} /> 复制
            </button>
            <button onClick={() => handleContextAction('paste')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Clipboard size={14} /> 黏贴
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
            <button onClick={() => handleContextAction('delete')} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                <Trash2 size={14} /> 删除
            </button>
        </div>
      )}

    </div>
  );
};

const ToolbarButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-nebula-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-xs">
     <Icon size={14} />
     <span>{label}</span>
  </button>
);

export default FrontendDesigner;
