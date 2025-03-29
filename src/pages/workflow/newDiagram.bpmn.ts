/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-02-26 14:38:23
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-02-26 15:02:35
 * @Description:
 */
export default `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1kf1h76" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.32.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.22.0">
  <bpmn:process id="Process_0fe5acx" name="报警流程" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="开始">
      <bpmn:outgoing>Flow_13vc5hf</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_13vc5hf" sourceRef="StartEvent_1" targetRef="userTask_1" />
    <bpmn:userTask id="userTask_1" name="报警处理" camunda:candidateUsers="66b5114b-0083-48aa-860a-06f1c06ce4c4,3cac0bfa-f404-4949-ac75-a01765250c4f">
      <bpmn:incoming>Flow_13vc5hf</bpmn:incoming>
      <bpmn:outgoing>Flow_15vt0s8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="Event_0pi0xma" name="结束">
      <bpmn:incoming>Flow_15vt0s8</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_15vt0s8" sourceRef="userTask_1" targetRef="Event_0pi0xma" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0fe5acx">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="189" y="145" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0nwtpyv_di" bpmnElement="userTask_1">
        <dc:Bounds x="320" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0pi0xma_di" bpmnElement="Event_0pi0xma">
        <dc:Bounds x="522" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="529" y="145" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_13vc5hf_di" bpmnElement="Flow_13vc5hf">
        <di:waypoint x="218" y="120" />
        <di:waypoint x="320" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_15vt0s8_di" bpmnElement="Flow_15vt0s8">
        <di:waypoint x="420" y="120" />
        <di:waypoint x="522" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
