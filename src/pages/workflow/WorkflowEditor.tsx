/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-03-05 19:24:55
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-10 10:05:07
 * @Description:
 */
import { FC, useEffect, useRef, useState } from 'react';
import { ComLayout, ComContent } from '@/components';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Breadcrumb } from 'antd';
import { useTranslate } from '@/hooks';
import { PageProps } from '@/common-types';
import { getSearchParamsObj } from '@/utils';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import defaultXML from './newDiagram.bpmn';
import modules from './modules';
import styles from './WorkflowEditor.module.scss';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';
import Toolbar from './Toolbar';
import modelerStore from '@/stores/workflowEditor-store';
import { observer } from 'mobx-react-lite';
import ComText from '@/components/com-text';

const WorkflowEditor: FC<PageProps> = ({ location }) => {
  const state = getSearchParamsObj(location?.search) || {};
  const navigate = useNavigate();
  const breadcrumbList = [
    {
      name: 'workflow',
      path: '/workflow',
    },
    {
      name: state.name || '',
    },
  ];
  const formatMessage = useTranslate();
  const [loading, setLoading] = useState(true);
  const { modeler } = modelerStore;
  const inputFileRef = useRef<HTMLInputElement>();

  useEffect(() => {
    setLoading(false);
    const newModeler = new BpmnModeler({
      container: '#canvas',
      propertiesPanel: {
        parent: '#properties',
      },
      additionalModules: [
        // 左侧节点栏
        BpmnPropertiesPanelModule,
        // 右侧属性栏
        BpmnPropertiesProviderModule,
        // 适配camunda属性
        CamundaPlatformPropertiesProviderModule,
        ...modules.additionalModules,
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
      ...modules.customConfig,
    });

    modelerStore.setModeler(newModeler);
  }, []);

  useEffect(() => {
    if (modeler) getDetail();
  }, [modeler]);

  const getDetail = () => {
    if (!modeler) return;
    // TODO 请求详情
    modeler.importXML(defaultXML).catch((err) => {
      console.error('Error importing XML:', err);
    });
  };

  // 保存
  const handleSave = async () => {
    if (!modeler) return;
    const { error, xml } = await modeler.saveXML({});
    // 读取异常时抛出异常
    if (error) {
      console.error(`[Process Designer Warn ]: ${error.message || error}`);
    }
    // TODO 进行保存操作
    console.log(xml);
  };

  // 启动
  const handleStart = async () => {
    if (!modeler) return;
    const { error, xml } = await modeler.saveXML({});
    // 读取异常时抛出异常
    if (error) {
      console.error(`[Process Designer Warn ]: ${error.message || error}`);
    }
    // TODO 进行启动操作
    console.log(xml);
  };

  // const handleOpen = () => {
  //   if (!inputFileRef.current) return;

  //   inputFileRef.current.click();
  // };

  // 打开
  const handleChangeFile = () => {
    if (!inputFileRef.current?.files) return;

    const reader = new FileReader();
    reader.readAsText(inputFileRef.current.files[0]);
    reader.onload = function () {
      const xmlStr = this.result;
      modeler?.importXML(xmlStr as string).catch((err) => {
        console.error('Error importing XML:', err);
      });
    };
  };

  return (
    <ComLayout loading={loading}>
      <ComContent
        backPath={'/workflow'}
        style={{ overflow: 'hidden' }}
        hasPadding
        border={false}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Breadcrumb
              separator=">"
              items={breadcrumbList?.map((item: any, idx: number) => {
                if (idx + 1 === breadcrumbList?.length) {
                  return {
                    title: item.name,
                  };
                }
                return {
                  title: <ComText>{item.name}</ComText>,
                  onClick: () => {
                    if (!item.path) return;
                    navigate(item.path);
                  },
                };
              })}
            />
            <div>
              <Space>
                <Button type="primary" onClick={handleSave}>
                  {formatMessage('common.save')}
                </Button>
                <Button type="primary" onClick={handleStart}>
                  {formatMessage('workflowEditor.start')}
                </Button>
                <Button>{formatMessage('workflowEditor.suspend')}</Button>
              </Space>
            </div>
          </div>
        }
      >
        <div className={styles.container}>
          <Toolbar />
          <div className={styles.canvas} id="canvas"></div>
          <div className={styles.propertiesPanel} id="properties"></div>
        </div>
        <input
          type="file"
          ref={inputFileRef as React.RefObject<HTMLInputElement>}
          style={{ display: 'none' }}
          accept=".xml,.bpmn"
          onChange={handleChangeFile}
        ></input>
      </ComContent>
    </ComLayout>
  );
};

export default observer(WorkflowEditor);
