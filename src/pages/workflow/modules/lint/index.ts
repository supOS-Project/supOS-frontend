/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-02-27 14:56:14
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-10 09:05:33
 * @Description:
 */
import Bpmnlinter from 'bpmn-js-bpmnlint';
import bpmnlint from './bpmnlint';
import 'bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css';

export default {
  additionalModules: [Bpmnlinter],
  linting: {
    active: true,
    bpmnlint: bpmnlint,
  },
};
