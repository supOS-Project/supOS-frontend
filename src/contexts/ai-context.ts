import { createContext, useContext } from 'react';
import aiStore, { AiStore } from '@/stores/ai-store';

export const AiContext = createContext<AiStore>(aiStore);
export const useAiContext = () => useContext(AiContext);
