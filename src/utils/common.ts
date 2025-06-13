export const isJsonString = (str: string): boolean => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

type CopyCallback = (success: boolean) => void;

// 使用 const 定义一个函数，并同时指定参数和返回值的类型
export const copyToClipboard: (text: string, callback?: CopyCallback) => void = (
  text: string,
  callback?: CopyCallback
): void => {
  const handleResult = (success: boolean) => {
    if (callback) {
      callback(success);
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    // 使用 Clipboard API
    navigator.clipboard
      .writeText(text)
      .then(() => {
        handleResult(true); // 成功时处理结果
      })
      .catch(() => {
        handleResult(false); // 失败时处理结果
      });
  } else {
    // 回退到旧的方式：创建一个临时的 textarea 元素
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // 将其隐藏并添加到 DOM 中
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    // 选择文本并执行复制命令
    try {
      const successful = document.execCommand('copy');
      handleResult(successful); // 根据成功或失败处理结果
    } catch (err) {
      console.log(err);
      handleResult(false); // 出错时处理结果
    }
    // 移除临时的 textarea 元素
    document.body.removeChild(textarea);
  }
};

export function canModifyParentHref() {
  try {
    if (window.parent === window || !window.parent) {
      return false;
    }

    const parentOrigin = window.parent.location.origin;
    const currentOrigin = window.location.origin;

    if (parentOrigin === currentOrigin) {
      // 同域
      return true;
    }

    return false;
  } catch (e) {
    console.log(e);
    // 跨域
    return -1;
  }
}
