import { createContext, useContext } from 'react';
import themeStore, { ThemeStore } from '@/stores/theme-store';

export const ThemeContext = createContext<ThemeStore>(themeStore);
export const useThemeContext = () => useContext(ThemeContext);
