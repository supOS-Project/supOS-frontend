import { forwardRef, Key, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Empty, Flex, Spin, Tree, TreeProps } from 'antd';
import { useSize } from 'ahooks';
import cx from 'classnames';
import type { DataNodeProps, ProTreeProps, ProTreeRef } from './types';
import './index.scss';
import HighlightText from '@/components/pro-tree/HighlightText.tsx';
import ControlledDropdown, { ControlledDropdownRef } from '../controlled-dropdown';

const ProTree = forwardRef<ProTreeRef, ProTreeProps>((props, ref) => {
  const {
    footer,
    header,
    empty,
    height,
    treeData,
    wrapperStyle,
    wrapperClassName,
    specialStyle = true,
    rightClickMenuItems,
    onRightClick,
    titleRender,
    treeNodeIcon,
    treeNodeExtra,
    treeNodeCount,
    treeNodeClassName,
    loading,
    loadMoreData,
    lazy,
    loadData,
    showSwitcherIcon = true,
    matchHighlightValue,
    ...restProps
  } = props;
  const treeContentRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<ControlledDropdownRef>(null);
  const treeRef = useRef<any>(null);
  const [treeHeight, setTreeHeight] = useState(height);
  const [rightClickNode, setRightClickNode] = useState<Key>();

  useImperativeHandle(ref, () => ({
    scrollTo: treeRef.current?.scrollTo,
  }));

  const treeContentSize = useSize(treeContentRef);

  useEffect(() => {
    if (height !== undefined && treeContentSize?.height !== undefined) {
      // 虚拟滚动设置自适应高度
      setTreeHeight(treeContentSize?.height);
    }
  }, [treeContentSize?.height, height]);

  const onRightClickHandle: TreeProps['onRightClick'] = (info) => {
    const { event, node } = info;
    const _node = { ...node };
    // 如果是加载更多节点，右键不生效
    if ((_node as DataNodeProps).isLoadMoreNode && lazy) return;
    if (rightClickMenuItems) {
      const items = typeof rightClickMenuItems === 'function' ? rightClickMenuItems(info) : rightClickMenuItems;
      if (items?.length) {
        setRightClickNode(_node.key);
      }
      dropdownRef?.current?.showDropdown(event, items);
    }
    onRightClick?.(info);
  };

  const _Empty = empty ? empty : <Empty />;

  const _titleRender = (node: DataNodeProps) => {
    const title = node.title as ReactNode;
    const _title = titleRender ? titleRender?.(node) : title;
    const Icon = typeof treeNodeIcon === 'function' ? treeNodeIcon(node) : treeNodeIcon;
    const Extra = typeof treeNodeExtra === 'function' ? treeNodeExtra(node) : treeNodeExtra;
    const Count = typeof treeNodeCount === 'function' ? treeNodeCount(node) : treeNodeCount;
    if (node.isLoadMoreNode && loadMoreData && lazy) {
      loadMoreData?.(node);
      return title;
      // return <LoadMoreNode node={node} loadMoreData={loadMoreData} />;
    }
    const Dom = rightClickNode ? (
      <span className={cx({ 'has-right-click': rightClickNode === node.key })}>
        <HighlightText needle={matchHighlightValue} haystack={_title} />
      </span>
    ) : (
      <HighlightText needle={matchHighlightValue} haystack={_title} />
    );
    if (specialStyle) {
      return (
        <Flex className={cx('treeNodeClassName', 'custom-tree-node')} align="center" gap={8}>
          {Icon && <div className="custom-tree-node-icon">{Icon}</div>}
          <Flex style={{ flex: 1, overflow: 'hidden' }} align="center" gap={8}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="custom-tree-node-title">
                {Dom}
                {Count}
              </div>
            </div>
            {Extra && (
              <div className="custom-tree-node-extra" style={{ flexShrink: 0 }}>
                {Extra}
              </div>
            )}
          </Flex>
        </Flex>
      );
    }
    return (
      <div className={treeNodeClassName}>
        {Icon}
        {Dom}
        {Count}
        {Extra}
      </div>
    );
  };

  return (
    <Spin wrapperClassName="pro-tree-loading" spinning={!!loading}>
      <div
        className={cx('pro-tree-wrap', wrapperClassName, {
          'pro-tree-special': specialStyle,
          'pro-tree-expend': !showSwitcherIcon,
        })}
        style={wrapperStyle}
      >
        {header && <div className="pro-tree-header">{header}</div>}
        <div className="pro-tree-content" ref={treeContentRef}>
          {!treeData?.length ? (
            <Flex justify="center" align="center" style={{ height: '100%' }}>
              {_Empty}
            </Flex>
          ) : (
            <Tree
              ref={treeRef}
              blockNode
              {...restProps}
              onRightClick={onRightClickHandle}
              titleRender={_titleRender}
              treeData={treeData}
              height={treeHeight}
              loadData={lazy ? loadData : undefined}
            />
          )}
        </div>
        <ControlledDropdown
          ref={dropdownRef}
          onOpenChange={(open) => {
            if (!open) {
              setRightClickNode(undefined);
            }
          }}
        />
        {footer && <div className="pro-tree-footer">{footer}</div>}
      </div>
    </Spin>
  );
});

export default ProTree;
