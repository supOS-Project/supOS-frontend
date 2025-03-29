import { RefObject, useEffect, useState } from 'react';
import Clipboard from 'clipboard';
import { message } from 'antd';
import { useTranslate } from '@/hooks';

// 复制的hooks
const useClipboard = (buttonRef: RefObject<HTMLElement>, textToCopy: string, msg?: string) => {
  const [isCopied, setIsCopied] = useState(false); // 状态：是否成功复制
  const formatMessage = useTranslate();

  useEffect(() => {
    if (!buttonRef.current) return;

    const clipboard = new Clipboard(buttonRef.current, {
      text: () => textToCopy, // 复制的内容
    });

    clipboard.on('success', () => {
      setIsCopied(true); // 更新状态为已复制
      message.success(msg ?? `${formatMessage('common.copySuccess')}: ${textToCopy}`).then(() => {
        setIsCopied(false);
      });
    });

    clipboard.on('error', () => {
      setIsCopied(false); // 复制失败时状态重置
      console.error('Failed to copy text');
    });

    return () => {
      clipboard.destroy(); // 清除事件监听和实例
    };
  }, [buttonRef, textToCopy]);

  return { isCopied }; // 返回按钮的 ref 和复制状态
};

export default useClipboard;
