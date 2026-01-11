import React from 'react';
import { 
  FileCode2, FileJson, FileText, Image as ImageIcon, 
  Layout, Database, Coffee, Terminal, Globe, Table, Settings
} from 'lucide-react';

export type EditorLanguage = 
  | 'javascript' | 'typescript' | 'java' | 'python' | 'html' | 'css' 
  | 'json' | 'sql' | 'markdown' | 'xml' | 'yaml' | 'vue' | 'react' 
  | 'plaintext' | 'image' | 'properties';

export interface EditorConfig {
  language: EditorLanguage;
  icon: any; // LucideIcon
  label: string;
  canPreview: boolean;
  sampleContent: string;
}

// Default generic config
const defaultConfig: EditorConfig = {
  language: 'plaintext',
  icon: FileText,
  label: 'Plain Text',
  canPreview: false,
  sampleContent: ''
};

// Plugin Registry
const registry: Record<string, EditorConfig> = {
  // Web / Frontend
  'js': { language: 'javascript', icon: FileCode2, label: 'JavaScript', canPreview: false, sampleContent: "console.log('Hello World');" },
  'ts': { language: 'typescript', icon: FileCode2, label: 'TypeScript', canPreview: false, sampleContent: "export const sum = (a: number, b: number): number => a + b;" },
  'jsx': { language: 'react', icon: FileCode2, label: 'React JSX', canPreview: false, sampleContent: "export const App = () => <div>Hello React</div>;" },
  'tsx': { language: 'react', icon: FileCode2, label: 'React TSX', canPreview: false, sampleContent: "interface Props { name: string; }\nexport const App: FC<Props> = ({name}) => <div>Hello {name}</div>;" },
  'vue': { language: 'vue', icon: Layout, label: 'Vue', canPreview: false, sampleContent: "<template>\n  <div>{{ msg }}</div>\n</template>\n\n<script>\nexport default {\n  data() { return { msg: 'Hello Vue' } }\n}\n</script>" },
  'html': { language: 'html', icon: Globe, label: 'HTML', canPreview: true, sampleContent: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>" },
  'css': { language: 'css', icon: Layout, label: 'CSS', canPreview: false, sampleContent: "body { background: #f0f0f0; }" },
  'json': { language: 'json', icon: FileJson, label: 'JSON', canPreview: false, sampleContent: "{\n  \"name\": \"nebula\",\n  \"version\": \"1.0.0\"\n}" },
  
  // Backend / Data
  'java': { language: 'java', icon: Coffee, label: 'Java', canPreview: false, sampleContent: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Java\");\n  }\n}" },
  'py': { language: 'python', icon: Terminal, label: 'Python', canPreview: false, sampleContent: "def hello():\n    print('Hello Python')" },
  'sql': { language: 'sql', icon: Database, label: 'SQL', canPreview: false, sampleContent: "SELECT * FROM users WHERE status = 'active';" },
  'xml': { language: 'xml', icon: FileCode2, label: 'XML', canPreview: false, sampleContent: "<root>\n  <item>Value</item>\n</root>" },
  'yaml': { language: 'yaml', icon: Table, label: 'YAML', canPreview: false, sampleContent: "version: 1.0\nservices:\n  web:\n    image: nginx" },
  'yml': { language: 'yaml', icon: Table, label: 'YAML', canPreview: false, sampleContent: "version: 1.0\nservices:\n  web:\n    image: nginx" },
  'properties': { language: 'properties', icon: Settings, label: 'Properties', canPreview: false, sampleContent: "server.port=8080\nspring.application.name=nebula" },
  
  // Docs / Assets
  'md': { language: 'markdown', icon: FileText, label: 'Markdown', canPreview: true, sampleContent: "# Project Title\n\n## Introduction\nThis is a readme file." },
  'txt': { language: 'plaintext', icon: FileText, label: 'Plain Text', canPreview: false, sampleContent: "Just some text." },
  'png': { language: 'image', icon: ImageIcon, label: 'Image', canPreview: true, sampleContent: "" },
  'jpg': { language: 'image', icon: ImageIcon, label: 'Image', canPreview: true, sampleContent: "" },
  'jpeg': { language: 'image', icon: ImageIcon, label: 'Image', canPreview: true, sampleContent: "" },
  'svg': { language: 'image', icon: ImageIcon, label: 'SVG', canPreview: true, sampleContent: "" },
};

export const getEditorConfig = (filename: string): EditorConfig => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return registry[ext] || defaultConfig;
};