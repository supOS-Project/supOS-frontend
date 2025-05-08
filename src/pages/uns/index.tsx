import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { App, Radio, Drawer, Splitter, Breadcrumb } from 'antd';
import { useDeepCompareEffect } from 'ahooks';
import { ChevronDown, ChevronUp, Copy, TreeView as TreeViewIcon } from '@carbon/icons-react';
import { AuthButton, ComLayout, ComLeft, ComContent } from '@/components';
import { useClipboard, useTranslate } from '@/hooks';
import { ButtonPermission } from '@/common-types/button-permission';
import { observer } from 'mobx-react-lite';
import { getTreeData, getAllLabel, getAllTemplate, deleteLabel, deleteTemplate } from '@/apis/inter-api/uns';
import { useAiContext } from '@/contexts/ai-context';
import {
  ImportModal,
  ExportModal,
  TopicDetail,
  ModelDetail,
  useCreateModal,
  useDeleteModal,
  Dashboard,
  Tree,
  LabelDetail,
  useTemplateModal,
  TemplateDetail,
  useLabelModal,
} from './components';
import { Loading } from '@/components';

import './index.scss';
import { useGuideSteps } from '@/hooks';
import I18nStore from '@/stores/i18n-store';
import { some } from 'lodash';
import { useRoutesContext } from '@/contexts/routes-context';
import useUnsGlobalWs from '@/pages/uns/useUnsGlobalWs.ts';
import { useMediaSize } from '@/hooks';
import { useUnsTreeMapContext } from '@/UnsTreeMapContext';
import RealTimeData from './components/RealTimeData';
import UnusedTopicTree from './components/uns-tree/UnusedTopicTree';
import { getExternalTreeData } from '@/apis/inter-api/external';
import ComText from '@/components/com-text';

const panelCloseSize = 48;
const panelOpenSize = 500;

const Module = () => {
  const [treeData, setTreeData] = useState<any>([]);
  const aiStore = useAiContext();
  const [currentTreeData, setCurrentTreeData] = useState([]); //当前eCharts的文件树
  const [currentPath, setCurrentPath] = useState(''); //当前文件路径
  const [pathArr, setPathArr] = useState([]); //当前文件路径Array
  const [showType, setShowType] = useState<number | null>(null); //0:文件夹;1:模板;2:文件;
  const [importModal, setImportModal] = useState(false);
  const [addNamespaceForAi, setAddNamespaceForAi] = useState<any>(null);
  const routesStore = useRoutesContext();
  const [treeMap, setTreeMap] = useState(true);
  const [nodeValue, setNodeValue] = useState(0);
  const [treeType, setTreeType] = useState<string>('treemap');
  const [loading, setLoading] = useState(false);
  const [targetNode, setTargetNode] = useState<any>(null);
  const formatMessage = useTranslate();
  const { modal, message } = App.useApp();
  const { topologyData, icmpStates } = useUnsGlobalWs();

  const [currentTreeMapType, setCurrentTreeMapType] = useState<string>('all');
  // 针对Unused订阅的topic进行实时数据展示
  const [unusedTopicTreeData, setUnusedTopicTreeData] = useState<any>([]); // unusedTopic订阅
  const [currentUnusedTopicPath, setCurrentUnusedTopicPath] = useState(''); // 当前unusedTopic文件路径
  const [unusedTopicPathArr, setUnusedTopicPathArr] = useState([]); //当前文件路径Array
  const [unusedTopicLoading, setUnusedTopicLoading] = useState(false);
  const [unusedTopicPanelSize, setUnusedTopicPanelSize] = useState([0, panelCloseSize]);

  const copyPathRef = useRef(null);
  const unsTreeRef = useRef<any>(null);
  const exportRef = useRef<any>(null);
  const unusedTopicTreeRef = useRef<any>(null);
  const splitterWrapRef = useRef<any>(null);

  // 新手导航步骤
  const unsStep7: any = {
    id: 'uns_step7',
    modalOverlayOpeningPadding: 0,
    title: I18nStore.getIntl('uns.guide7Title'),
    text: I18nStore.getIntl('uns.guide7Text1'),
    attachTo: {
      element: '#uns_create_modal_top',
      on: 'left',
    },
    buttons: [
      {
        action() {
          setMockNextStep(1);
          return tour.back();
        },
        text: I18nStore.getIntl('global.tipBack'),
        classes: 'prev-class',
      },
      {
        action() {
          setModalClose();
          return tour.complete();
        },
        text: I18nStore.getIntl('global.tipDone'),
      },
    ],
  };

  const unsStep6: any = {
    id: 'uns_step6',
    title: I18nStore.getIntl('uns.guide6Title'),
    modalOverlayOpeningPadding: 0,
    text: `
    ${I18nStore.getIntl('uns.guide6Text1')}
    <br />
    ${I18nStore.getIntl('uns.guide6Text2')}
    `,
    attachTo: {
      element: '#uns_create_modal_top',
      on: 'auto',
    },
    buttons: [
      {
        action() {
          setModalClose();
          return tour.back();
        },
        text: I18nStore.getIntl('global.tipBack'),
        classes: 'prev-class',
      },
      {
        action() {
          setMockNextStep(2);
          if (!some(tour.steps, (step) => step.id === unsStep7.id)) {
            tour.addStep(unsStep7);
          }
          return tour.next();
        },
        text: I18nStore.getIntl('global.tipNext'),
      },
    ],
  };

  const unsStep5: any = {
    id: 'uns_step5',
    title: I18nStore.getIntl('uns.guide5Title'),
    text: `
    ${I18nStore.getIntl('uns.guide5Text1')}
    `,
    attachTo: {
      element: '#uns_create_file_btn',
      on: 'auto',
    },
    buttons: [
      {
        action() {
          setOptionOpen('addFolder', currentPath);
          setTimeout(() => {
            return tour.back();
          }, 500);
        },
        text: I18nStore.getIntl('global.tipBack'),
        classes: 'prev-class',
      },
      {
        action() {
          setOptionOpen('addFile', currentPath);
          if (!some(tour.steps, (step) => step.id === unsStep6.id)) {
            tour.addStep(unsStep6);
          }
          setTimeout(() => {
            return tour.next();
          }, 500);
        },
        text: I18nStore.getIntl('global.tipNext'),
      },
    ],
  };

  const unsStep4: any = {
    id: 'uns_step4',
    modalOverlayOpeningPadding: 0,
    title: I18nStore.getIntl('uns.guide4Title'),
    text: `
    ${I18nStore.getIntl('uns.guide4Text1')}
    <br/>
    ${I18nStore.getIntl('uns.guide4Text2')}
    `,
    attachTo: {
      element: '#uns_create_modal_bottom',
      on: 'auto',
    },
    buttons: [
      {
        action() {
          return tour.back();
        },
        text: I18nStore.getIntl('global.tipBack'),
        classes: 'prev-class',
      },
      {
        action() {
          setModalClose();
          if (!some(tour.steps, (step) => step.id === unsStep5.id)) {
            tour.addStep(unsStep5);
          }
          return tour.next();
        },
        text: I18nStore.getIntl('global.tipNext'),
      },
    ],
  };

  const unsStep3: any = {
    id: 'uns_step3',
    title: I18nStore.getIntl('uns.guide3Title'),
    modalOverlayOpeningPadding: 0,
    text: `
      ${I18nStore.getIntl('uns.guide3Text1')}
    `,
    attachTo: {
      element: '#uns_create_modal_top',
      on: 'left',
    },
    buttons: [
      {
        action() {
          // 上一步 关闭新增弹窗
          setModalClose();
          return tour.back();
        },
        text: I18nStore.getIntl('global.tipBack'),
        classes: 'prev-class',
      },
      {
        action() {
          if (!some(tour.steps, (step) => step.id === unsStep4.id)) {
            tour.addStep(unsStep4);
          }
          return tour.next();
        },
        text: I18nStore.getIntl('global.tipNext'),
      },
    ],
  };

  // 新手导航
  const { tour } = useGuideSteps([
    {
      id: 'uns_step1',
      title: I18nStore.getIntl('uns.guide1Title'),
      text: `
      ${I18nStore.getIntl('uns.guide1Text1', { appTitle: routesStore.systemInfo.appTitle })}
      <ul class="user-guide-list">
        <li>${I18nStore.getIntl('uns.guide1Text2')}</li>
        <li>${I18nStore.getIntl('uns.guide1Text3')}</li>
        <li>${I18nStore.getIntl('uns.guide1Text4')}</li>
      </ul>
      `,
      attachTo: {
        element: '#uns_left_tree',
        on: 'right-start',
      },
      buttons: [
        {
          action() {
            return tour.complete();
          },
          text: I18nStore.getIntl('global.tipExit'),
          classes: 'prev-class',
        },
        {
          action() {
            return tour.next();
          },
          text: I18nStore.getIntl('global.tipNext'),
        },
      ],
    },
    {
      id: 'uns_step2',
      title: I18nStore.getIntl('uns.guide2Title'),
      text: `
        ${I18nStore.getIntl('uns.guide2Text1')}
      `,
      attachTo: {
        element: '#uns_create_folder_btn',
        on: 'auto',
      },
      buttons: [
        {
          action() {
            return tour.back();
          },
          text: I18nStore.getIntl('global.tipBack'),
          classes: 'prev-class',
        },
        {
          action() {
            // 下一步是新建文件夹，需打开新增弹弹窗
            setOptionOpen('addFolder', currentPath);
            // 下一步，增加需展示的步骤(弹窗后需定位到下一步元素进行导航，所以在此处动态添加)
            if (!some(tour.steps, (step) => step.id === unsStep3.id)) {
              tour.addStep(unsStep3);
            }
            setTimeout(() => {
              return tour.next();
            }, 500);
          },
          text: I18nStore.getIntl('global.tipNext'),
        },
      ],
    },
  ]);
  tour.on('cancel', () => {
    setModalClose();
  });

  useClipboard(copyPathRef, currentTreeMapType === 'all' ? currentPath : currentUnusedTopicPath);

  useEffect(() => {
    initTreeData({ reset: true });
    initUnusedTopicTreeData({ reset: true });
  }, [treeType]);

  useDeepCompareEffect(() => {
    if (aiStore?.aiResult?.uns) {
      setAddNamespaceForAi(aiStore.aiResult?.uns);
      aiStore?.setAiResult('uns', undefined);
    }
  }, [aiStore?.aiResult?.uns]);

  useEffect(() => {
    //监听文件路径获取最新的文件树
    if (currentPath && typeof currentPath === 'string') {
      const newPathArr: any = currentPath.replace(/^\//, '').replace(/\/$/, '').split('/');
      setPathArr(newPathArr);
      const findTreeData = (data: any) => {
        data.forEach((e: any) => {
          if (e.path === currentPath) {
            if (e?.children?.length) {
              setNodeValue(e.countChildren || 0);
              changeCurrentTreeData([e]);
            } else {
              setNodeValue(0);
              changeCurrentTreeData([]);
            }
          } else if (e?.children?.length) {
            findTreeData(e.children);
          }
        });
      };
      findTreeData(treeData);

      //处理来源于面包屑和echarts的选中路径
      const result = findPathToNode(treeData, currentPath);
      const expandedArr = unsTreeRef.current?.expandedArr || [];
      const newArr = JSON.parse(JSON.stringify(expandedArr));
      result.forEach((path: any) => {
        if (!expandedArr.includes(path) && path) {
          newArr.push(path);
        }
      });
      unsTreeRef.current?.setExpandedArr(newArr);
    } else if (currentPath && typeof currentPath === 'number') {
      changeCurrentTreeData([]);
    } else {
      changeCurrentTreeData([]);
      setShowType(null);
    }
  }, [currentPath, treeData]);

  useEffect(() => {
    //监听文件路径获取最新的文件树
    if (currentUnusedTopicPath && typeof currentUnusedTopicPath === 'string') {
      const newPathArr: any = currentUnusedTopicPath.replace(/^\//, '').replace(/\/$/, '').split('/');
      setUnusedTopicPathArr(newPathArr);
    }
  }, [currentUnusedTopicPath]);

  useEffect(() => {
    if (targetNode) {
      changeCurrentPath(targetNode);
      scrollTreeNode(targetNode.path);
      setTargetNode(null);
    }
  }, [treeData]);

  useLayoutEffect(() => {
    const updatePanelSize = () => {
      if (splitterWrapRef.current) {
        setUnusedTopicPanelSize([splitterWrapRef.current.offsetHeight - panelCloseSize, panelCloseSize]);
      }
    };
    updatePanelSize();
    const resizeObserver = new ResizeObserver(updatePanelSize);
    if (splitterWrapRef.current) {
      resizeObserver.observe(splitterWrapRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 查找并返回从根节点到指定路径节点的所有父节点的path
  const findPathToNode = (tree: any, targetPath: string) => {
    let result: any = [];

    const search = (node: any, currentPath: any) => {
      if (!node) return false;

      // 当前节点就是目标节点
      if (node.path === targetPath) {
        result = [...currentPath];
        return true;
      }

      // 检查节点是否有children属性
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          // 将当前节点的path加入路径
          currentPath.push(node.path);

          if (search(child, currentPath)) {
            return true; // 找到了就停止搜索
          }

          // 如果没有找到，移除当前节点的path
          currentPath.pop();
        }
      }
      return false;
    };

    // 从根节点开始搜索
    for (const root of tree) {
      if (search(root, [])) break;
    }

    return result;
  };
  const resetTreeData = () => {
    setTreeData([]);
    setCurrentPath('');
  };

  //初始化树数据
  const initTreeData = ({ reset, query, type }: any, cb?: () => void) => {
    setLoading(true);
    switch (treeType) {
      case 'treemap':
        getTreeData({ key: query, type })
          .then((res: any) => {
            if (res?.length) {
              setTreeData(res);
              if (reset) {
                changeCurrentPath({});
                unsTreeRef.current?.setExpandedArr([]);
                scrollTreeNode(res[0]?.path);
              }
            } else {
              resetTreeData();
              unsTreeRef.current?.setExpandedArr([]);
            }
            if (cb) cb();
          })
          .catch((err) => {
            resetTreeData();
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
        break;
      case 'template':
        unsTreeRef.current?.setExpandedArr([]);
        getAllTemplate({ key: query, pageNo: 0, pageSize: 9999 })
          .then((res: any) => {
            if (res && Array.isArray(res)) {
              setTreeData(res.map((res: any) => ({ ...res, name: res.path, path: res.id, type: 1, value: 0 })));
              if (reset) {
                changeCurrentPath({});
                scrollTreeNode(res[0]?.path);
              }
              if (cb) cb();
            } else {
              resetTreeData();
            }
          })
          .catch((err) => {
            resetTreeData();
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
        break;
      case 'label':
        unsTreeRef.current?.setExpandedArr([]);
        getAllLabel({ key: query })
          .then((res: any) => {
            if (res && Array.isArray(res)) {
              setTreeData(res.map(({ labelName, id }: any) => ({ name: labelName, path: id, type: 9, value: 0 })));
              if (reset) {
                changeCurrentPath({});
                scrollTreeNode(res[0]?.path);
              }
              if (cb) cb();
            } else {
              resetTreeData();
            }
          })
          .catch((err) => {
            resetTreeData();
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
          });
        break;
      default:
        break;
    }
  };

  //初始化UnusedTopic树数据
  const initUnusedTopicTreeData = ({ reset, query }: any, cb?: () => void) => {
    setUnusedTopicLoading(true);
    if (treeType === 'treemap') {
      getExternalTreeData({ key: query })
        .then((res: any) => {
          if (res?.length) {
            setUnusedTopicTreeData(res);
            if (reset) {
              changeCurrentUnusedTopicPath({});
              unusedTopicTreeRef.current?.setExpandedArr([]);
              scrollUnusedTopicTreeNode(res[0]?.path);
            }
          } else {
            setUnusedTopicTreeData([]);
            setCurrentUnusedTopicPath('');
            unusedTopicTreeRef.current?.setExpandedArr([]);
          }
          if (cb) cb();
        })
        .catch((err) => {
          setUnusedTopicTreeData([]);
          setCurrentUnusedTopicPath('');
          console.log(err);
        })
        .finally(() => {
          setUnusedTopicLoading(false);
        });
    }
  };
  const { DeleteModal, setDeleteOpen } = useDeleteModal({ successCallBack: initTreeData, currentPath: currentPath });

  const handleDelete = (path: any, item: any) => {
    switch (treeType) {
      case 'treemap':
        setDeleteOpen(item);
        break;
      case 'label':
        modal.confirm({
          content: formatMessage('uns.areYouSureToDeleteThisLabel'),
          cancelText: formatMessage('common.cancel'),
          okText: formatMessage('common.confirm'),
          onOk() {
            deleteLabel(path).then(() => {
              initTreeData({ reset: path === currentPath });
              message.success(formatMessage('common.deleteSuccessfully'));
            });
          },
        });
        break;
      case 'template':
        modal.confirm({
          content: formatMessage('common.deleteConfirm'),
          cancelText: formatMessage('common.cancel'),
          okText: formatMessage('common.confirm'),
          onOk() {
            deleteTemplate(path).then(() => {
              initTreeData({ reset: path === currentPath });
              message.success(formatMessage('common.deleteSuccessfully'));
            });
          },
        });
        break;
      default:
        break;
    }
  };

  const changeCurrentTreeData = (tree: any) => {
    setCurrentTreeData(tree);
  };

  const changeCurrentPath = (currentNode: any) => {
    const { path, type } = currentNode;
    if (path === currentPath) {
      setCurrentPath('');
      setShowType(null);
    } else {
      setCurrentPath(path || '');
      setShowType(typeof type === 'number' ? type : null);
    }
    setCurrentUnusedTopicPath('');
    setCurrentTreeMapType('all');
  };
  const changeCurrentUnusedTopicPath = (currentNode: any) => {
    const { path, type } = currentNode;
    if (path === currentUnusedTopicPath) {
      setCurrentUnusedTopicPath('');
      setShowType(null);
    } else {
      setCurrentUnusedTopicPath(path || '');
      setShowType(typeof type === 'number' ? type : null);
    }
    setCurrentPath('');
    setCurrentTreeMapType('unusedTopic');
  };

  //滚动到目标树节点
  const scrollTreeNode = (key: string) => {
    setTimeout(() => {
      if (unsTreeRef.current) unsTreeRef.current.scrollTo(key);
    }, 500);
  };

  //滚动到目标树节点
  const scrollUnusedTopicTreeNode = (key: string) => {
    setTimeout(() => {
      if (unusedTopicTreeRef.current) unusedTopicTreeRef.current.scrollTo(key);
    }, 500);
  };

  const { OptionModal, setOptionOpen, setModalClose, setMockNextStep } = useCreateModal({
    successCallBack: initTreeData,
    addNamespaceForAi,
    setAddNamespaceForAi,
    changeCurrentPath,
    scrollTreeNode,
    setTreeMap,
  });

  const { TemplateModal, openTemplateModal } = useTemplateModal({
    successCallBack: initTreeData,
    changeCurrentPath,
    scrollTreeNode,
    setTreeMap,
  });

  const { LabelModal, setLabelOpen } = useLabelModal({
    successCallBack: initTreeData,
    changeCurrentPath,
    scrollTreeNode,
    setTreeMap,
  });

  //面包屑上改变文件路径
  const changePath = (index: number, pArr: any[], sourceData: any[]) => {
    const newArr = pArr.slice(0, index);
    const findTreeNode = (data: any) => {
      data.forEach((e: any) => {
        //匹配路径上的模型
        if (`${newArr.join('/')}/` === e.path) {
          if (currentTreeMapType === 'all') {
            setCurrentPath(e.path);
          } else {
            setCurrentUnusedTopicPath(e.path);
          }
          setShowType(e.type);
        } else if (e?.children?.length) {
          findTreeNode(e.children);
        }
      });
    };
    findTreeNode(sourceData);
  };

  const toTargetNode = (type: string, node: any) => {
    setTreeMap(false);
    setCurrentTreeData([]);
    setTreeType(type);
    setTargetNode(node);
  };

  const getDetailDom = (type: number | null, currentTreeData: any) => {
    switch (type) {
      case 0:
        return (
          <ModelDetail
            currentPath={currentPath}
            treeData={currentTreeData}
            changeCurrentPath={changeCurrentPath}
            nodeValue={nodeValue}
          />
        );
      case 1:
        return <TemplateDetail currentPath={currentPath} setDeleteOpen={handleDelete} initTreeData={initTreeData} />;
      case 2:
        return (
          <TopicDetail
            fileStatusInfo={icmpStates?.find((s: any) => s.topic === currentPath)}
            currentPath={currentPath}
            setDeleteOpen={setDeleteOpen}
          />
        );
      case 9:
        return <LabelDetail labelDetailId={currentPath} initTreeData={initTreeData} />;
      default:
        return null;
    }
  };
  const getTopicBreadcrumb = (pArr: any[], sourceData: any[]) => (
    <>
      <Breadcrumb
        style={{ fontWeight: 700 }}
        separator=">"
        items={pArr?.map((e: any, idx: number) => {
          if (idx + 1 === pArr?.length) {
            return {
              title: e,
            };
          }
          return {
            title: <ComText>{e}</ComText>,
            onClick: () => changePath(idx + 1, pArr, sourceData),
          };
        })}
      />
      <div className="copyBox" ref={copyPathRef} title={formatMessage('common.copy')}>
        <Copy />
      </div>
    </>
  );

  const { isTreeMapVisible, setTreeMapVisible } = useUnsTreeMapContext();
  const { isH5 } = useMediaSize();

  const treeMapHtml = (
    <div ref={splitterWrapRef} style={{ height: 'calc(100% - 48px)' }}>
      <Splitter layout="vertical" onResize={setUnusedTopicPanelSize} className="unusedTopicTree-Splitter">
        <Splitter.Panel min={120} size={unusedTopicPanelSize[0]}>
          <Loading spinning={loading}>
            <Radio.Group
              id="uns_left_tree"
              onChange={(e) => {
                setShowType(null);
                setTreeType(e.target.value);
                setCurrentTreeData([]);
                setCurrentPath('');
              }}
              value={treeType}
              style={{ padding: '16px 14px' }}
              size="small"
            >
              <Radio.Button value="treemap" title={formatMessage('uns.tree')}>
                {formatMessage('uns.tree')}
              </Radio.Button>
              <Radio.Button value="template" title={formatMessage('common.template')}>
                {formatMessage('common.template')}
              </Radio.Button>
              <Radio.Button value="label" title={formatMessage('common.label')}>
                {formatMessage('common.label')}
              </Radio.Button>
            </Radio.Group>
            <div style={{ padding: '0 14px', height: 'calc(100% - 56px)' }}>
              <Tree
                unsTreeRef={unsTreeRef}
                treeData={treeData}
                icmpStates={icmpStates}
                currentPath={currentPath}
                initTreeData={initTreeData}
                showDeleteModal={handleDelete}
                showCopyModal={setOptionOpen}
                showCopyTemModal={openTemplateModal}
                showAddTemModal={openTemplateModal}
                showAddLabModal={setLabelOpen}
                setTreeMap={setTreeMap}
                changeCurrentPath={changeCurrentPath}
                treeType={treeType}
                showType={showType}
                addNamespaceForAi={addNamespaceForAi}
                setAddNamespaceForAi={setAddNamespaceForAi}
                toTargetNode={toTargetNode}
              />
            </div>
          </Loading>
        </Splitter.Panel>
        {treeType === 'treemap' && (
          <Splitter.Panel size={unusedTopicPanelSize[1]} min={panelCloseSize} style={{ overflow: 'hidden' }}>
            <div
              className="unusedTopicTree-collapsible"
              onClick={() => {
                if (unusedTopicPanelSize[1] === panelCloseSize) {
                  setUnusedTopicPanelSize([splitterWrapRef.current?.offsetHeight - panelOpenSize, panelOpenSize]);
                } else {
                  setUnusedTopicPanelSize([splitterWrapRef.current?.offsetHeight - panelCloseSize, panelCloseSize]);
                }
              }}
            >
              {formatMessage('uns.otherTopic', 'Raw Topics')}
              {unusedTopicPanelSize[1] === panelCloseSize ? <ChevronUp /> : <ChevronDown />}
            </div>
            <div style={{ height: 'calc(100% - 48px)', padding: '8px 14px 0' }}>
              <Loading spinning={unusedTopicLoading}>
                <UnusedTopicTree
                  unsTreeRef={unusedTopicTreeRef}
                  treeData={unusedTopicTreeData}
                  icmpStates={icmpStates}
                  currentPath={currentUnusedTopicPath}
                  initTreeData={initUnusedTopicTreeData}
                  setTreeMap={setTreeMap}
                  changeCurrentPath={changeCurrentUnusedTopicPath}
                  treeType={treeType}
                  showType={showType}
                />
              </Loading>
            </div>
          </Splitter.Panel>
        )}
      </Splitter>
    </div>
  );

  return (
    <ComLayout className="unsContainer">
      {!isH5 ? (
        <ComLeft style={{ overflow: 'hidden' }} resize defaultWidth={360}>
          <div
            className="treemapTitle"
            onClick={() => {
              setTreeMap(true);
              changeCurrentPath({});
            }}
          >
            <TreeViewIcon />
            <span>{formatMessage('uns.treeList')}</span>
          </div>
          {treeMapHtml}
        </ComLeft>
      ) : (
        isTreeMapVisible && (
          <Drawer
            className="treemap-drawer"
            rootClassName="treemap-drawer-root"
            placement="right"
            onClose={() => setTreeMapVisible(false)}
            open={isTreeMapVisible}
            getContainer={false}
          >
            {treeMapHtml}
          </Drawer>
        )
      )}
      <ComContent>
        <div className="chartWrap">
          <div className="chartTop">
            {treeType === 'treemap' ? (
              <div className="chartTopL">
                {currentTreeMapType === 'all' && currentPath && getTopicBreadcrumb(pathArr, treeData)}
                {currentTreeMapType === 'unusedTopic' &&
                  currentUnusedTopicPath &&
                  getTopicBreadcrumb(unusedTopicPathArr, unusedTopicTreeData)}
              </div>
            ) : (
              <span />
            )}
            <div className="chartTopR">
              <AuthButton
                auth={ButtonPermission['uns.importNamespace']}
                type="primary"
                onClick={() => setImportModal(true)}
                size="small"
              >
                {formatMessage('common.import')}
              </AuthButton>
              <AuthButton
                auth={ButtonPermission['uns.export']}
                color="default"
                variant="filled"
                style={{ background: '#c6c6c6', color: '#161616' }}
                onClick={() => {
                  exportRef.current?.setOpen(true);
                }}
                size="small"
              >
                {formatMessage('uns.export')}
              </AuthButton>
            </div>
          </div>
          {treeMap ? (
            <Dashboard topologyData={topologyData} />
          ) : currentTreeMapType === 'all' ? (
            getDetailDom(showType, currentTreeData)
          ) : (
            <RealTimeData showType={showType} topic={currentUnusedTopicPath} />
          )}
        </div>
      </ComContent>
      <ImportModal
        importModal={importModal}
        setImportModal={setImportModal}
        initTreeData={initTreeData}
        type={unsTreeRef.current?.searchType}
        query={unsTreeRef.current?.searchQuery}
      />
      <ExportModal exportRef={exportRef} treeData={treeData} />
      {OptionModal}
      {DeleteModal}
      {TemplateModal}
      {LabelModal}
    </ComLayout>
  );
};
export default observer(Module);
