import { createContext, useContext } from 'react';
import routesStore, { RoutesStore } from '@/stores/routes-store.ts';

export const RoutesContext = createContext<RoutesStore>(routesStore);
export const useRoutesContext = () => useContext(RoutesContext);
