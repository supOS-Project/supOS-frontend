/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-02-26 15:56:34
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-02-28 13:18:58
 * @Description:
 */
import translations from './zh-cn';

function customTranslate(template: string, replacements: { [x: string]: string }) {
  replacements = replacements || {};

  // Translate
  template = translations[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, (_: string, key: string | number) => {
    return replacements[key] || `{${key}}`;
  });
}

export default {
  __init__: ['translate'],
  translate: ['value', customTranslate],
};
