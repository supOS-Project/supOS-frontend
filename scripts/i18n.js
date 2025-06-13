import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import messages from '../src/locale/index.js';
import translateText from './tmtClient.js';

// 语言配置项
const LANGUAGES = ['zh-CN', 'en-US'];

const loadLanguageFile = (key) => {
  const filePath = `./src/locale/${key}.json`;
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {};
};

const oldMessages = {}; // 旧的语言文件
let newMessages = {}; // 新的语言文件

// 根据配置加载语言文件
LANGUAGES.forEach((langKey) => {
  oldMessages[langKey] = loadLanguageFile(langKey);
});

// 遍历messages，将其写入语言文件
const intl = async () => {
  for (const key of Object.keys(messages)) {
    for (const langKey of LANGUAGES) {
      if (!newMessages[langKey]) {
        newMessages[langKey] = {};
      }

      // 如果是中文，直接写入
      if (langKey === 'zh-CN') {
        newMessages[langKey][key] = messages[key];
        continue;
      }

      // 如果不存在，翻译并写入
      if (!oldMessages[langKey]?.[key]) {
        newMessages[langKey][key] = await translateText(messages[key], langKey);
        continue;
      }

      // 已存在，直接复用
      newMessages[langKey][key] = oldMessages[langKey][key];
    }
  }

  // 生成新的语言文件
  LANGUAGES.forEach((langKey) => {
    fs.writeFileSync(`./src/locale/${langKey}.json`, JSON.stringify(newMessages[langKey], null, 2) + '\n');
  });
};

// 执行异步处理
intl().catch(console.error);
