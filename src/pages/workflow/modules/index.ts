/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-02-28 15:48:41
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-06 13:13:59
 * @Description:
 */
import TokenSimulationModule from 'bpmn-js-token-simulation';
import lintModule from './lint';
import minimapModule from './minimap';
import gridModule from './grid';
import customTranslate from './i18n';
import magicPropertiesProvider from './customProperties';

export default {
  additionalModules: [
    // 模拟流程
    TokenSimulationModule,
    // 校验
    ...lintModule.additionalModules,
    // 小地图
    ...minimapModule.additionalModules,
    // 网格
    ...gridModule.additionalModules,
    // i18n
    customTranslate,
    // 自定义属性配置
    magicPropertiesProvider,
  ],
  customConfig: {
    linting: lintModule.linting,
    minimap: minimapModule.minimap,
    gridLine: gridModule.gridLine,
  },
};
