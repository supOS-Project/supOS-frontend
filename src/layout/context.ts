import { CopilotRefProps } from '@/components/copilotkit/CustomCopilotChat';
import { createContext, MutableRefObject, useContext } from 'react';

export const CopilotOperationContext = createContext<MutableRefObject<CopilotRefProps | undefined> | undefined>(
  undefined
);

export const useCopilotOperationContext = () => useContext(CopilotOperationContext);
