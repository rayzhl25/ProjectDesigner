
import React, { useState, useEffect } from 'react';
import ProjectDesigner from './components/ProjectDesigner';
import { User, ThemeMode, Language } from './types';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  // Mock User
  const [user] = useState<User>({
    id: 'admin',
    name: 'Administrator',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  });

  const [theme] = useState<ThemeMode>('system');
  const [lang] = useState<Language>('zh');

  // Directly open the first mock project
  const [currentProject, setCurrentProject] = useState<any | null>(MOCK_PROJECTS[0]);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ProjectDesigner
      project={currentProject}
      lang={lang}
      onBack={() => { }}
    />
  );
};

export default App;
