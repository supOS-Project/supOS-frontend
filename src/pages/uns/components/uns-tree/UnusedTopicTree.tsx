import { FC, useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { Search } from '@carbon/react';
import { Renew, Folder, FolderOpen, Document } from '@carbon/icons-react';
import debounce from 'lodash/debounce';
import { useTranslate } from '@/hooks';
import { App, Flex, Divider } from 'antd';
import { ComTree } from '@/components';
import HighlightText from './HighlightText';
import { generatePaths, findParentIds, collectChildrenIds } from '@/utils';
import StatusDot from '@/pages/uns/components/uns-tree/StatusDot';
import { IcmpStatesType } from '@/pages/uns/useUnsGlobalWs';
import './index.scss';

export interface UnusedTopicTreeProps {
  treeData: any[];
  currentPath: string;
  initTreeData: (data: any, cb?: () => void) => void;
  setTreeMap?: (params: any) => void;
  changeCurrentPath: (currentNode: any) => void;
  treeHeight?: number;
  unsTreeRef?: any;
  treeType: string;
  showType: number | null;
  icmpStates?: IcmpStatesType;
}

export interface RightKeyMenuItem {
  auth: string;
  menuTitle: string;
  click: () => void;
  height: number;
}

const UnusedTopicTree: FC<UnusedTopicTreeProps> = ({
  treeData,
  currentPath,
  initTreeData,
  changeCurrentPath,
  setTreeMap,
  treeHeight = 0,
  unsTreeRef,
  treeType,
  icmpStates,
}) => {
  const [expandedArr, setExpandedArr] = useState<any>([]); //展开的树节点
  const [searchType, setSearchType] = useState(1); //搜索类型
  const [searchQuery, setSearchQuery] = useState(''); //搜索参数
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

  return (
    <div className="treeWrap">
      <Flex gap="8px" className="treeSearchBox">
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
        titleRender={(item: any) => {
          const icmpInfo = icmpStates?.find((s: any) => s.topic === item.path);
          return (
            <div
              className={`customTreeNode`}
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
            </div>
          );
        }}
      />
    </div>
  );
};
export default UnusedTopicTree;
