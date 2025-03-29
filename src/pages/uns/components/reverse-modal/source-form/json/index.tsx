import { FC, useState, useEffect, useRef } from 'react';
import { Form, Input, Flex, Button, Divider, App } from 'antd';
import { ComCheckbox } from '@/components';
import { ChevronLeft, ChevronRight, Folder, FolderOpen, Document } from '@carbon/icons-react';
import TagSelect from '@/pages/uns/components/use-create-modal/components/TagSelect';
import FieldsFormList from '../../components/FieldsFormList';
import JsonTree from './JsonTree';
import type { TreeNode, FieldItem } from './JsonTree';
import { json2fsTree, batchReverser } from '@/apis/inter-api/uns';
import { noDuplicates, removeLastPathSegment } from '@/utils';

import './index.scss';

const { TextArea } = Input;

export interface JsonFormProps {
  formatMessage: any;
  types: string[];
  currentPath: string;
  close: (refreshTree?: boolean) => void;
  fullScreen: boolean;
}

const JsonForm: FC<JsonFormProps> = ({ formatMessage, types, currentPath, close, fullScreen }) => {
  const form = Form.useFormInstance();
  const [isSave, setIsSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bottomBtns, setBottomBtns] = useState(['next']);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<TreeNode | undefined>(undefined);

  const { message } = App.useApp();

  const jsonTreeRef = useRef<any>(null);

  const currentNodeName = Form.useWatch(['currentNode', 'name'], form) || form.getFieldValue(['currentNode', 'name']);

  //校验JSON格式
  const validatorJson = (_: any, value: string) => {
    if (!value) return Promise.reject(new Error(formatMessage('uns.pleaseEnterJSON')));
    try {
      JSON.parse(value);
      return Promise.resolve();
      // eslint-disable-next-line
    } catch (err) {
      return Promise.reject(new Error(formatMessage('uns.errorInTheSyntaxOfTheJSON')));
    }
  };

  //递归修改树节点信息
  const modifyNodesRecursively = (nodes: TreeNode[], parentDataPath?: string): void => {
    nodes.forEach((node) => {
      node.parentDataPath = parentDataPath;
      // 如果存在子节点，则递归地修改每个子节点
      if (node.children && node.children.length > 0) {
        node.icon = ({ expanded }: any) => (expanded ? <FolderOpen /> : <Folder />);
        node.type = 0;
        modifyNodesRecursively(node.children, node.dataPath);
      } else {
        node.icon = <Document />;
        node.type = 2;
      }
    });
  };

  //获取路径上的所有父节点
  const getAllParentPaths = (paths: string[]): string[] => {
    const allPaths: string[] = [];

    for (const path of paths) {
      const segments = path.split('.');
      let currentPath = '';

      // 构建当前路径的所有父路径
      for (const segment of segments) {
        currentPath = currentPath ? `${currentPath}.${segment}` : segment;
        if (!allPaths.includes(currentPath)) {
          allPaths.push(currentPath);
        }
      }
    }
    return allPaths;
  };

  //根据dataPath获取目标树节点信息
  const getTargetNode = (treeData: TreeNode[], targetDataPath: string): TreeNode | null => {
    for (const node of treeData) {
      if (node.dataPath === targetDataPath) {
        return { ...node };
      }
      // 如果存在子节点并且还没有找到目标节点，则递归搜索子节点
      if (node.children && node.children.length > 0) {
        const foundNode = getTargetNode(node.children, targetDataPath);
        if (foundNode) {
          return { ...foundNode }; // 找到目标节点后立即返回
        }
      }
    }
    return null; // 如果遍历完整个树都没有找到，则返回null
  };

  const prevStep = () => {
    setSelectedInfo(undefined);
    setIsSave(false);
  };

  const nextStep = () => {
    form.validateFields().then(async (values) => {
      const res: any = await json2fsTree(JSON.parse(values.jsonData || null));
      modifyNodesRecursively(res);
      setTreeData(res);
      setIsSave(true);
    });
  };

  const save = async () => {
    const checked = jsonTreeRef.current?.checkedKeys;
    const newChecked = checked.slice(); //浅拷贝

    const values = await form.validateFields();
    if (!checked?.length) {
      message.warning(formatMessage('uns.treeNoCheckedTip'));
      return;
    }
    if (!values) return;

    //根据dataPath数组获取树节点组成的数组
    const checkedNodes = getAllParentPaths(newChecked)
      .map((item: string) => getTargetNode(treeData, item))
      .filter((node): node is TreeNode => !!node);

    //获取最终提交的数组
    const newCheckedNodes = checkedNodes.map((node: TreeNode) => {
      const { type, name, newDataPath, dataPath, description, tags, save2db, mainKey, fields } = node;
      if (typeof mainKey === 'number' && mainKey > -1) {
        fields?.forEach((field: FieldItem, index: number) => {
          if (values.dataType === 2 && index === mainKey) {
            field.unique = true;
          }
        });
      }
      const startPath = currentPath.endsWith('/') ? currentPath : removeLastPathSegment(currentPath);
      const path = newDataPath || dataPath;
      return type === 0
        ? {
            topic: `${startPath}${path.replace(/\./g, '/')}/`,
            name,
            description,
            fields,
          }
        : {
            topic: `${startPath}${path.replace(/\./g, '/')}`,
            dataType: values.dataType,
            name,
            description,
            labelNames: tags?.map((tag: any) => tag.label || tag.value) || [],
            save2db: save2db || false,
            fields,
          };
    });

    //校验提交树同级节点重复名称
    if (!noDuplicates(newCheckedNodes.map((e) => e.topic))) {
      message.error(formatMessage('uns.topicDuplicateTip'));
      return;
    }
    try {
      setLoading(true);
      const res: any = await batchReverser(newCheckedNodes);
      if (res?.code === 200) {
        message.success(formatMessage('appGui.saveSuccess'));
        setLoading(false);
        close(true);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      const { data, code, msg }: any = err;
      if (code === 206) {
        message.error({
          type: 'error',
          content: (
            <div>
              {data.map((item: string) => (
                <div style={{ textAlign: 'left' }}>{item}</div>
              ))}
            </div>
          ),
          duration: 5,
        });
        if (data.length !== newCheckedNodes.filter((item) => !item.topic.endsWith('/')).length) close(true);
      } else {
        message.error(msg);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSave) {
      setBottomBtns(['prev', 'save']);
    } else {
      setBottomBtns(['next']);
    }
  }, [isSave]);

  const renderContent = () => {
    return isSave ? (
      <>
        <Flex gap={10} style={{ height: fullScreen ? 'calc(100vh - 330px)' : '400px' }}>
          <JsonTree
            ref={jsonTreeRef}
            treeData={treeData}
            setTreeData={setTreeData}
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
          />
          {selectedInfo && (
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '0 10px' }}>
              <Flex align="center" gap={5}>
                <span style={{ flexShrink: 0, height: '16px' }}>
                  {selectedInfo.type === 2 ? <Document /> : <Folder />}
                </span>
                <span>{currentNodeName}</span>
              </Flex>
              <Divider style={{ borderColor: '#c6c6c6', margin: '10px 0' }} />
              <Form.Item
                name={['currentNode', 'name']}
                label={formatMessage('common.name')}
                validateTrigger={['onBlur', 'onChange']}
                rules={[
                  { required: true, message: formatMessage('uns.pleaseInputName') },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/, message: formatMessage('uns.nameFormat') },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={['currentNode', 'description']}
                label={formatMessage(`uns.${selectedInfo?.type === 2 ? 'fileDescription' : 'folderDescription'}`)}
              >
                <TextArea rows={2} placeholder="" />
              </Form.Item>
              {selectedInfo.type === 2 ? (
                <>
                  <Form.Item name={['currentNode', 'tags']} label={formatMessage('common.label')}>
                    <TagSelect />
                  </Form.Item>
                  <Divider style={{ borderColor: '#c6c6c6' }} />
                  <Form.Item
                    name={['currentNode', 'save2db']}
                    label={formatMessage('uns.persistence')}
                    valuePropName="checked"
                  >
                    <ComCheckbox />
                  </Form.Item>
                </>
              ) : (
                <Divider style={{ borderColor: '#c6c6c6' }} />
              )}
              <FieldsFormList types={types} keepOne={selectedInfo.type === 2} />
            </div>
          )}
        </Flex>
        <Divider style={{ borderColor: '#c6c6c6' }} />
      </>
    ) : (
      <Form.Item
        name="jsonData"
        label=""
        wrapperCol={{ span: 24 }}
        rules={[{ required: true, validator: validatorJson }]}
        validateTrigger={['onBlur', 'onChange']}
      >
        <TextArea
          allowClear
          placeholder={formatMessage('uns.pleaseEnterJSON')}
          style={{ height: fullScreen ? 'calc(100vh - 305px)' : '300px' }}
        />
      </Form.Item>
    );
  };

  const renderButtons = () => {
    return bottomBtns.map((item) => {
      switch (item) {
        case 'prev':
          return (
            <Button color="primary" variant="filled" size="small" icon={<ChevronLeft />} onClick={prevStep} key={item}>
              {formatMessage('uns.prev')}
            </Button>
          );
        case 'next':
          return (
            <Button
              color="primary"
              variant="filled"
              size="small"
              icon={<ChevronRight />}
              iconPosition="end"
              onClick={nextStep}
              key={item}
            >
              {formatMessage('uns.next')}
            </Button>
          );
        case 'save':
          return (
            <Button color="primary" variant="solid" size="small" onClick={save} loading={loading} key={item}>
              {formatMessage('common.save')}
            </Button>
          );
        default:
          return null;
      }
    });
  };

  return (
    <>
      {renderContent()}
      <Flex justify="flex-end" gap={10}>
        {renderButtons()}
      </Flex>
    </>
  );
};
export default JsonForm;
