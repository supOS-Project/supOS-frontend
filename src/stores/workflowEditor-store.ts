import { makeAutoObservable } from 'mobx';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import Selection from 'diagram-js/lib/features/selection/Selection';
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type CommandStack from 'diagram-js/lib/command/CommandStack';

class WorkflowEditorStore {
  modeler?: BpmnModeler;
  modeling?: Modeling;
  selection?: Selection;
  align?: any;
  canvas?: Canvas;
  elementRegistry?: ElementRegistry;
  command?: CommandStack;
  minimap?: any;

  constructor() {
    makeAutoObservable(this); // 响应式处理
  }

  setModeler(modeler: BpmnModeler) {
    this.modeler = modeler;
    this.modeling = modeler.get<Modeling>('modeling');
    this.selection = modeler.get<Selection>('selection');
    this.align = modeler.get<any>('alignElements');
    this.canvas = modeler.get<Canvas>('canvas');
    this.elementRegistry = modeler.get<ElementRegistry>('elementRegistry');
    this.command = modeler.get<CommandStack>('commandStack');
    this.minimap = modeler.get<any>('minimap');
  }
}

const modeler = new WorkflowEditorStore();
export default modeler;
