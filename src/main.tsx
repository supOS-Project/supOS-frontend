// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import routesStore from '@/stores/routes-store';
import themeStore from '@/stores/theme-store';
import { RoutesContext } from '@/contexts/routes-context';
import { ThemeContext } from '@/contexts/theme-context';
import App from './App.tsx';
import { AiContext } from '@/contexts/ai-context';
import aiStore from '@/stores/ai-store';
import { CopilotKit } from '@copilotkit/react-core';
import './index.scss';

console.info(
  `%csupOS Frontend Version: ${import.meta.env.VITE_APP_VERSION}_${import.meta.env.VITE_APP_BUILD_TIMESTAMP}`,
  'color: #4CAF50; font-size: 16px; font-weight: bold;'
);

createRoot(document.getElementById('root')!).render(
  <CopilotKit runtimeUrl={`/copilotkit`} showDevConsole={false}>
    <ThemeContext.Provider value={themeStore}>
      <RoutesContext.Provider value={routesStore}>
        <AiContext.Provider value={aiStore}>
          <App />
        </AiContext.Provider>
      </RoutesContext.Provider>
    </ThemeContext.Provider>
  </CopilotKit>
);
