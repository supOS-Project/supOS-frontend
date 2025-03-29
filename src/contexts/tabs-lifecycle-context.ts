import { createContext, useContext, useEffect } from 'react';

export const TabsLifecycleContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activate: (_: () => void) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unActivate: (_: () => void) => {},
});
export const useTabLifecycle = () => useContext(TabsLifecycleContext);

// 自定义 Hook：激活时触发
export const useActivate = (cb: () => void) => {
  const { activate } = useTabLifecycle();
  useEffect(() => {
    activate(cb);
  }, [activate, cb]);
};

// 自定义 Hook：未激活时触发
export const useUnActivate = (cb: () => void) => {
  const { unActivate } = useTabLifecycle();
  useEffect(() => {
    unActivate(cb);
  }, [unActivate, cb]);
};
