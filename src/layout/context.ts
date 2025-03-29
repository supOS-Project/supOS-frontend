import { createContext, MutableRefObject, useContext } from 'react';
import { CopilotRefProps } from '@/components';

export const CopilotOperationContext = createContext<MutableRefObject<CopilotRefProps | undefined> | undefined>(
  undefined
);

export const useCopilotOperationContext = () => useContext(CopilotOperationContext);
