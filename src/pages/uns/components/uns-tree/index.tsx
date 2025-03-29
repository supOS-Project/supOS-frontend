import { FC, useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { Search } from '@carbon/react';
import {
  Subtract,
  Copy,
  DocumentAdd,
  FolderAdd,
  Renew,
  Filter,
  Folder,
  FolderOpen,
  Document,
  GroupObjectsNew,
  TrashCan,
  RepoArtifact,
} from '@carbon/icons-react';
import { getInstanceInfo, getModelInfo } from '@/apis/inter-api/uns';
import debounce from 'lodash/debounce';
import { useTranslate } from '@/hooks';
import { App, Flex, Popover, Button, Space, Radio, Divider } from 'antd';
import Icon from '@ant-design/icons';
import { TagAdd, ComPopupGuide, ComTree, AuthWrapper } from '@/components';
import { useViewLabelModal } from '@/pages/uns/components';
import HighlightText from './HighlightText';
import { useCopilotOperationContext } from '@/layout/context';
import { removeLastPathSegment, generatePaths, findParentIds, collectChildrenIds, hasPermission } from '@/utils';
import { ButtonPermission } from '@/common-types/button-permission';
import StatusDot from '@/pages/uns/components/uns-tree/StatusDot';
import { IcmpStatesType } from '@/pages/uns/useUnsGlobalWs';
import ReverseModal from '../reverse-modal';
import './index.scss';

export interface UnsTreeProps {
  treeData: any[];
  currentPath: string;
  initTreeData: (data: any, cb?: () => void) => void;
  showDeleteModal: (path: string | number, item?: any) => void;
  showCopyModal: (type: any, path: any, copyText?: string) => void;
  showAddTemModal: (type: any, path: any) => void;
  showCopyTemModal: (type: any, path: any) => void;
  showAddLabModal: () => void;
  setTreeMap?: (params: any) => void;
  changeCurrentPath: (currentNode: any) => void;
  treeHeight?: number;
  unsTreeRef?: any;
  treeType: string;
  showType: number | null;
  addNamespaceForAi: any;
  setAddNamespaceForAi: any;
  toTargetNode: (type: string, node: any) => void;
  icmpStates?: IcmpStatesType;
}

export interface RightKeyMenuItem {
  auth: string;
  menuTitle: string;
  click: () => void;
  height: number;
}

const deletePerMap: any = {
  treemap: ButtonPermission['uns.delete'],
  template: ButtonPermission['template.delete'],
  label: ButtonPermission['label.delete'],
};

const copyPerMap: any = {
  treemap: ButtonPermission['uns.copy'],
  template: ButtonPermission['template.copy'],
};

const UnsTree: FC<UnsTreeProps> = ({
  treeData,
  currentPath,
  initTreeData,
  showDeleteModal,
  showCopyModal,
  changeCurrentPath,
  setTreeMap,
  treeHeight = 0,
  unsTreeRef,
  treeType,
  showType,
  showAddTemModal,
  showAddLabModal,
  addNamespaceForAi,
  setAddNamespaceForAi,
  toTargetNode,
  icmpStates,
}) => {
  const copilotOperation = useCopilotOperationContext();
  const [expandedArr, setExpandedArr] = useState<any>([]); //展开的树节点
  const [searchType, setSearchType] = useState(1); //搜索类型
  const [searchQuery, setSearchQuery] = useState(''); //搜索参数
  const [rightKey, setRightKey] = useState({ visible: false, top: 0, left: 0 }); //节点右键参数
  const [rightKeyNode, setRightKeyNode] = useState<any>({}); //右键节点
  const [pasteTopic, setPasteTopic] = useState<any>(''); //复制的topic
  const [reverserOpen, setReverserOpen] = useState<boolean>(false); //复制的topic
  const { message } = App.useApp();
  const formatMessage = useTranslate();

  // 创建一个 ref 来引用 tree 元素
  const treeRef: any = useRef(null);
  const selectRef = useRef<any>(null);
  const isComposingRef = useRef(false); // 拼音输入中..

  useImperativeHandle(unsTreeRef, () => ({
    expandedArr: expandedArr,
    setExpandedArr: setExpandedArr,
    scrollTo: scrollTreeNode,
    searchType: searchType,
    searchQuery: searchQuery,
  }));

  const { ViewLabelModal, setLabelOpen } = useViewLabelModal({ toTargetNode: toTargetNode });

  useEffect(() => {
    //处理拼音输入法
    const inputElement = selectRef.current;

    if (inputElement) {
      const handleCompositionStart = () => {
        isComposingRef.current = true;
      };

      const handleCompositionEnd = (e: any) => {
        isComposingRef.current = false;
        const value = e.target.value;
        if (value) onSearchChange(value);
      };

      inputElement.addEventListener('compositionstart', handleCompositionStart);
      inputElement.addEventListener('compositionend', handleCompositionEnd);

      return () => {
        inputElement.removeEventListener('compositionstart', handleCompositionStart);
        inputElement.removeEventListener('compositionend', handleCompositionEnd);
      };
    }
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setSearchType(1);
  }, [treeType]);

  useEffect(() => {
    if (searchQuery && treeType === 'treemap') {
      if (searchQuery.includes('/')) {
        setExpandedArr(collectChildrenIds(treeData, ''));
      } else {
        setExpandedArr(findParentIds(searchQuery, treeData));
      }
    }
  }, [treeData]);

  useEffect(() => {
    const handleClick = () => {
      setRightKey((prevState) => ({ ...prevState, visible: false }));
      setRightKeyNode({});
    };

    document.addEventListener('click', handleClick);

    // 返回一个函数用于清除事件监听器，避免内存泄漏
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [setRightKey]); // 如果`setRightKey`依赖于某些props或state，请将它们也加入到依赖数组中。

  //滚动到目标树节点
  const scrollTreeNode = (key: any) => {
    treeRef.current.scrollTo({ key, align: 'top' });
  };

  //处理树节点展开收起逻辑
  const onExpand = (expandedKeys: any, { expanded, node }: any) => {
    const newArr = expandedKeys;
    if (expanded) {
      newArr.push(node.value);
    } else {
      const index = expandedKeys.findIndex((path: any) => path === node.value);
      newArr.splice(index, 1);
    }
    setExpandedArr([...new Set(newArr)]);
  };

  //处理右键菜单中节点展开收起逻辑
  const onRightMenuExpand = (paths: string[], expanded: boolean) => {
    const newArr = expanded ? [...expandedArr, ...paths] : expandedArr.filter((path: string) => !paths.includes(path));
    setExpandedArr([...new Set(newArr)]);
  };

  //删除节点
  const deleteNode = (e: any, path: string | number, item: any) => {
    e.stopPropagation();
    showDeleteModal(path, item);
  };

  const debouncedInitTreeData = useCallback(
    debounce((value) => {
      initTreeData({ reset: true, query: value, type: searchType });
    }, 500),
    [initTreeData, searchType] // 仅当 initTreeData 或 searchType 发生变化时更新 debounce 函数
  );

  //查询树节点
  const onSearchChange = (val: string) => {
    return debouncedInitTreeData(val);
  };

  const onRightClick = ({ event, node }: any) => {
    const { clientX, clientY } = event;
    let X = 0;
    getRightKeyMenu(node).forEach((item: any) => (X += item.height));

    setRightKey({
      visible: true,
      top: clientY + X > window.innerHeight ? Math.max(clientY - X, 0) : clientY,
      left: clientX,
    });
    setRightKeyNode({ ...node, value: node.path });
  };

  const popoverContent = (
    <div>
      <Radio.Group
        style={{
          width: '100px',
        }}
        onChange={(e) => {
          setSearchType(e.target.value);
          initTreeData({ reset: true, query: searchQuery, type: e.target.value });
        }}
        value={searchType}
      >
        <Space direction="vertical">
          <Radio value={1}>{formatMessage('fieldTypeSTRING')}</Radio>
          <Radio value={3}>{formatMessage('uns.hasTemplate')}</Radio>
          <Radio value={2}>{formatMessage('uns.hasLabel')}</Radio>
        </Space>
      </Radio.Group>
    </div>
  );

  const getRightKeyMenu = (node: any) => {
    return [
      {
        auth: 'viewLabels',
        menuTitle: formatMessage('common.viewLabels'),
        click: async () => {
          const getInfo = node.type === 2 ? getInstanceInfo : getModelInfo;
          const detail: any = await getInfo({ topic: node.path });
          if (detail?.labelList?.length > 0) {
            setLabelOpen(detail.labelList);
          } else {
            message.warning(formatMessage('uns.noLabel'));
          }
        },
        height: 32,
      },
      {
        auth: 'viewTemplate',
        menuTitle: formatMessage('common.viewTemplate'),
        click: async () => {
          const getInfo = node.type === 2 ? getInstanceInfo : getModelInfo;
          const detail: any = await getInfo({ topic: node.path });
          if (detail.modelId) {
            toTargetNode('template', { type: 1, path: detail.modelId });
          } else {
            message.warning(formatMessage('uns.noTemplate'));
          }
        },
        height: 32,
      },
      {
        auth: hasPermission(ButtonPermission['uns.rightKeyCopy']) ? 'copy' : '',
        menuTitle: formatMessage('common.copy'),
        click: () => {
          setPasteTopic(node.path);
          message.success(formatMessage('common.copySuccess'));
        },
        height: 32,
      },
      {
        auth: hasPermission(ButtonPermission['uns.paste']) ? 'paste' : '',
        menuTitle: formatMessage('common.paste'),
        click: () => {
          if (pasteTopic) {
            //纯前端方案
            showCopyModal('paste', node.type === 2 ? removeLastPathSegment(node.path) : node.path, pasteTopic);
          } else {
            message.warning(formatMessage('uns.copyTip'));
          }
        },
        height: 32,
      },
      {
        auth: hasPermission(ButtonPermission['uns.addFolder']) ? 'createNewFolder' : '',
        menuTitle: formatMessage('common.createNewFolder'),
        click: () => {
          showCopyModal('addFolder', node.type === 2 ? removeLastPathSegment(node.path) : node.path);
        },
        height: 32,
      },
      {
        auth: hasPermission(ButtonPermission['uns.addFile']) ? 'createNewFile' : '',
        menuTitle: formatMessage('common.createNewFile'),
        click: () => {
          showCopyModal('addFile', node.type === 2 ? removeLastPathSegment(node.path) : node.path);
        },
        height: 32,
      },
      {
        auth: node.type === 0 ? 'expandFolder' : '',
        menuTitle: formatMessage('common.expandFolder'),
        click: () => {
          onRightMenuExpand(collectChildrenIds(treeData, node.path), true);
        },
        height: 32,
      },
      {
        auth: node.type === 0 ? 'collapseFolder' : '',
        menuTitle: formatMessage('common.collapseFolder'),
        click: () => {
          onRightMenuExpand(collectChildrenIds(treeData, node.path), false);
        },
        height: 32,
      },
      {
        auth: deletePerMap[treeType] ? 'delete' : '',
        menuTitle: formatMessage('common.delete'),
        click: () => {
          showDeleteModal(node.path, node);
        },
        height: 40,
      },
    ].filter((item) => item.auth);
  };

  return (
    <div className="treeWrap">
      {rightKey.visible && (
        <div
          className="unsTreeRightMenuMask"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            background: 'transparent',
          }}
        >
          <div className="unsTreeRightMenuWrap" style={{ top: rightKey.top, left: rightKey.left }}>
            {getRightKeyMenu(rightKeyNode).map((item: RightKeyMenuItem) => {
              return item.auth === 'delete' ? (
                <div
                  className="rightKeyDelete"
                  onClick={item.click}
                  key={item.auth}
                  style={{ height: item.height + 'px' }}
                >
                  <span> {item.menuTitle}</span>
                  <TrashCan />
                </div>
              ) : (
                <div onClick={item.click} key={item.auth} style={{ height: item.height + 'px' }}>
                  {item.menuTitle}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Flex gap="8px" className="treeSearchBox">
        {treeType === 'treemap' && (
          <Popover placement="bottomLeft" title="" content={popoverContent} trigger="hover">
            <Button
              icon={<Filter />}
              style={{ flexShrink: 0, background: 'var(--cds-field)' }}
              color="default"
              variant="filled"
            />
          </Popover>
        )}
        <Search
          ref={selectRef}
          closeButtonLabelText="Clear search input"
          id="search-playground-1"
          labelText="Label text"
          placeholder={formatMessage('uns.inputText')}
          role="searchbox"
          size="sm"
          type="text"
          onChange={(e) => {
            const val = e.target.value || '';
            setSearchQuery(val);
            if (isComposingRef.current) return;
            onSearchChange(val);
          }}
          value={searchQuery}
          style={{ borderRadius: '3px', flex: 1 }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              initTreeData({ reset: true, query: searchQuery, type: searchType });
            }
          }}
        />
        {treeType === 'treemap' ? (
          <>
            <AuthWrapper auth={ButtonPermission['uns.addFile']}>
              <div className="treeOperateIconWrap" id="uns_create_file_btn">
                <span title={formatMessage('uns.newFile')}>
                  <ComPopupGuide
                    stepName="openFileNewModal"
                    steps={addNamespaceForAi?.steps}
                    currentStep={addNamespaceForAi?.currentStep}
                    onFinish={(_, nextStepName) => {
                      showCopyModal('addFile', currentPath || '/' + addNamespaceForAi?.rawData?.Namespace + '/');
                      setTimeout(() => {
                        setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
                      }, 500);
                    }}
                  >
                    <DocumentAdd
                      onClick={() =>
                        showCopyModal('addFile', showType === 2 ? removeLastPathSegment(currentPath) : currentPath)
                      }
                    />
                  </ComPopupGuide>
                </span>
              </div>
            </AuthWrapper>
            <AuthWrapper auth={ButtonPermission['uns.addFolder']}>
              <div className="treeOperateIconWrap " id="uns_create_folder_btn">
                <span title={formatMessage('uns.newFolder')}>
                  <ComPopupGuide
                    stepName="openFolderNewModal"
                    steps={addNamespaceForAi?.steps}
                    currentStep={addNamespaceForAi?.currentStep}
                    onBegin={() => {
                      copilotOperation?.current?.setOpen?.(false);
                    }}
                    onFinish={(_, nextStepName) => {
                      showCopyModal('addFolder', currentPath);
                      setTimeout(() => {
                        setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
                      }, 500);
                    }}
                  >
                    <FolderAdd
                      onClick={() =>
                        showCopyModal('addFolder', showType === 2 ? removeLastPathSegment(currentPath) : currentPath)
                      }
                    />
                  </ComPopupGuide>
                </span>
              </div>
            </AuthWrapper>
            <AuthWrapper auth={ButtonPermission['uns.batchReverseGeneration']}>
              <div className="treeOperateIconWrap ">
                <span title={formatMessage('uns.batchReverseGeneration')}>
                  <RepoArtifact onClick={() => setReverserOpen(true)} />
                </span>
              </div>
            </AuthWrapper>
          </>
        ) : (
          <AuthWrapper auth={ButtonPermission[treeType === 'template' ? 'template.add' : 'label.add']}>
            <div className="treeOperateIconWrap">
              {treeType === 'template' ? (
                <span title={formatMessage('uns.addTemplate')}>
                  <GroupObjectsNew
                    onClick={() => {
                      showAddTemModal('addTemplate', currentPath);
                    }}
                  />
                </span>
              ) : (
                <span title={formatMessage('uns.newLabel')}>
                  <Icon
                    component={TagAdd}
                    onClick={() => {
                      showAddLabModal();
                    }}
                  />
                </span>
              )}
            </div>
          </AuthWrapper>
        )}
        <div className="treeOperateIconWrap">
          <span title={formatMessage('uns.refresh')}>
            <Renew
              onClick={() => {
                initTreeData({ reset: false, type: searchType, query: searchQuery }, () => {
                  message.success(formatMessage('uns.refreshSuccessful'));
                });
              }}
            />
          </span>
        </div>
      </Flex>
      <Divider style={{ borderColor: '#c6c6c6', margin: '16px 0 10px 0' }} />
      <ComTree
        ref={treeRef}
        height={treeHeight}
        selectedKeys={[currentPath]}
        treeData={treeData}
        fieldNames={{ title: 'name', key: 'path' }}
        blockNode
        expandedKeys={expandedArr}
        onExpand={onExpand}
        notDataContent={
          treeData.length === 0 ? <div style={{ textAlign: 'center' }}>{formatMessage('uns.noData')}</div> : null
        }
        onRightClick={treeType === 'treemap' ? onRightClick : undefined}
        className={treeType !== 'treemap' ? 'noSwitcherNoopTree' : ''}
        titleRender={(item: any) => {
          const icmpInfo = icmpStates?.find((s: any) => s.topic === item.path);
          return (
            <div
              className={`customTreeNode ${rightKeyNode.path === item.path ? 'rightKeySelected' : ''}`}
              onClick={() => {
                changeCurrentPath(item);
                if (setTreeMap) setTreeMap(false);
              }}
              style={
                treeType === 'treemap'
                  ? {
                      color:
                        currentPath && generatePaths(currentPath).includes(item.path)
                          ? 'var(--supos-theme-color)'
                          : 'var(--supos-text-color)',
                    }
                  : {}
              }
            >
              {item.type === 0 &&
                (expandedArr.includes(item.path) && item.children ? (
                  <FolderOpen style={{ flexShrink: 0, marginRight: '5px' }} />
                ) : (
                  <Folder style={{ flexShrink: 0, marginRight: '5px' }} />
                ))}
              {item.type === 2 && (
                <Flex align={'center'} gap={8}>
                  {item.protocol === 'icmp' && <StatusDot status={!!icmpInfo?.status} />}
                  <Document style={{ flexShrink: 0, marginRight: '5px' }} />
                </Flex>
              )}
              <div className="customTreeNodeTitle">
                <HighlightText needle={searchQuery} haystack={item.name} />
                {item.type === 0 && (
                  <span style={{ color: 'var(--supos-text-color)', fontSize: '12px', opacity: 0.5 }}>
                    ({item.countChildren})
                  </span>
                )}
              </div>
              <div className="treeNodeIconWrap">
                {['treemap', 'template'].includes(treeType) && (
                  <AuthWrapper auth={copyPerMap[treeType]}>
                    <div className="treeOperateIconWrap">
                      <span title={formatMessage('common.copy')}>
                        <Copy
                          onClick={(e) => {
                            e.stopPropagation();
                            if (treeType === 'template') {
                              showAddTemModal('copyTemplate', item.path);
                            } else {
                              setPasteTopic(item.path);
                              message.success(formatMessage('common.copySuccess'));
                            }
                          }}
                        />
                      </span>
                    </div>
                  </AuthWrapper>
                )}
                <AuthWrapper auth={deletePerMap[treeType]}>
                  <div className="treeOperateIconWrap">
                    <span title={formatMessage('common.delete')}>
                      <Subtract onClick={(event) => deleteNode(event, item.path, item)} />
                    </span>
                  </div>
                </AuthWrapper>
              </div>
            </div>
          );
        }}
      />
      {ViewLabelModal}
      {reverserOpen && (
        <ReverseModal
          reverserOpen={reverserOpen}
          setReverserOpen={setReverserOpen}
          currentPath={currentPath || ''}
          initTreeData={initTreeData}
        />
      )}
    </div>
  );
};
export default UnsTree;
