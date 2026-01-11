
import React from 'react';
import { Layout, Braces, Code2, FileCode2, Layers } from 'lucide-react';

interface PluginProps {
  onInsert: (text: string) => void;
}

export const VueEditorPlugin: React.FC<PluginProps> = ({ onInsert }) => {
  const snippets = [
    { label: 'Template', icon: Layout, code: '<template>\n  <div>\n    \n  </div>\n</template>' },
    { label: 'Script Setup', icon: FileCode2, code: '<script setup lang="ts">\nimport { ref, onMounted } from \'vue\';\n\n</script>' },
    { label: 'Style', icon: Layers, code: '<style scoped>\n\n</style>' },
    { label: 'v-if', icon: Code2, code: 'v-if="condition"' },
    { label: 'v-for', icon: Code2, code: 'v-for="item in items" :key="item.id"' },
    { label: 'Props', icon: Braces, code: 'const props = defineProps<{ \n  title: string \n}>();' },
    { label: 'Emits', icon: Braces, code: 'const emit = defineEmits<{ \n  (e: \'change\', id: number): void \n}>();' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 custom-scrollbar">
      <span className="text-[10px] uppercase font-bold text-emerald-500 mr-2 flex-shrink-0">Vue Tools</span>
      {snippets.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onInsert(item.code)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-300 rounded border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors text-xs whitespace-nowrap"
          title={`Insert ${item.label}`}
        >
          <item.icon size={12} />
          {item.label}
        </button>
      ))}
    </div>
  );
};
