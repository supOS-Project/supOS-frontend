/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-02-27 14:56:14
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-10 09:04:55
 * @Description:
 */
import minimapModule from 'diagram-js-minimap';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import './index.css';

export default {
  additionalModules: [minimapModule],
  minimap: {
    open: true,
  },
};
