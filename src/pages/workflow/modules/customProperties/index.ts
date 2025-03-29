/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-03-06 13:13:33
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-06 13:25:44
 * @Description:
 */
import CustomPropertiesProvider from './provider/CustomPropertiesProvider';

export default {
  __init__: ['customPropertiesProvider'],
  customPropertiesProvider: ['type', CustomPropertiesProvider],
};
