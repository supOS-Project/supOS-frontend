import React, { useState, useRef, useEffect } from 'react';
import { Table, TableProps } from 'antd';
import type { TableColumnsType } from 'antd';
import classNames from 'classnames';
import './index.scss';
import { useTranslate } from '@/hooks';
import { useThemeStore } from '@/stores/theme-store.ts';

interface TitlePropsType {
  width?: number;
  minWidth?: number;
  changeWidth: (width: number) => void;
}

export interface ATableProps extends TableProps {
  columns: TableColumnsType;
  resizeable?: boolean;
  // 是否隐藏空白
  hiddenEmpty?: boolean;
  fixedPosition?: boolean; // 是否固定页码在底部
}
// 查找所有可滚动祖先元素（包括window）
const findScrollParents = (element: HTMLElement | null): (HTMLElement | Window)[] => {
  const parents: (HTMLElement | Window)[] = [];
  let current = element;

  while (current) {
    parents.push(current);
    const { overflow, overflowX, overflowY } = getComputedStyle(current);
    if (/(auto|scroll)/.test(overflow + overflowX + overflowY)) {
      break;
    }
    current = current.parentElement;
  }
  // 添加window作为可能的滚动容器
  parents.push(window);
  return parents;
};
const ResizableTitle: React.FC<Readonly<React.HTMLAttributes<any> & TitlePropsType>> = (props) => {
  const { changeWidth, width, minWidth = 100, children, ...restProps } = props;
  const [tableRect, setTableRect] = useState<DOMRect | null>(null);
  const isResizingRef: any = useRef(false);
  const thRef = useRef<HTMLTableHeaderCellElement>(null);
  const thStartXRef = useRef(0);
  const thWidthRef = useRef(width || 0);
  const diffXRef = useRef(0);
  const highLineRef = useRef<any>(null);

  const changeBodyUserSelect = (value: string) => {
    const bodyStyle = document.body.style;
    bodyStyle.userSelect = value; // Non-prefixed version, currently supported by all major browsers
  };

  const handleMouseDown = (e: any) => {
    if (!thRef.current) return;
    isResizingRef.current = true;
    // 拖拽开始时记录当前th最右侧的x坐标
    const currentX = thRef.current?.clientWidth + thRef.current?.getBoundingClientRect()?.x;
    // 拖拽开始时记录当前鼠标的x坐标
    thStartXRef.current = e.clientX;
    // 拖拽开始时记录当前鼠标的x坐标与th最右侧的x坐标的差值
    diffXRef.current = e.clientX - currentX + 1;
    highLineRef.current.style.left = currentX - 1 + 'px';
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // 拖拽开始时禁止文本选择功能
    changeBodyUserSelect('none');
    //添加高亮线
    document.body.appendChild(highLineRef.current);
  };

  const handleMouseMove = (e: any) => {
    if (!isResizingRef.current || !thRef.current) return;
    //实际宽度 = th的宽度 + 鼠标移动的距离 - 鼠标按下时的x坐标
    const realWidth = thRef.current?.clientWidth + e.clientX - thStartXRef.current;
    //记录当前th的最左侧的x坐标
    const thRectX = thRef.current?.getBoundingClientRect()?.x;
    // if (minWidth && realWidth < minWidth) {
    thWidthRef.current = Math.max(minWidth, realWidth);
    highLineRef.current.style.left = Math.max(thRectX + minWidth - 1, e.clientX - diffXRef.current) + 'px';
    // } else {
    //   thWidthRef.current = Math.max(80, realWidth);
    //   highLineRef.current.style.left = Math.max(thRectX + 80 - 1, e.clientX - diffXRef.current) + 'px';
    // }
  };

  const handleMouseUp = () => {
    if (highLineRef.current) {
      //移除高亮线
      document.body?.removeChild(highLineRef.current);
    }
    isResizingRef.current = false;
    document.body.style.cursor = '';
    //鼠标抬起的时候再改变宽度
    changeWidth(thWidthRef.current);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    // 拖拽结束时恢复文本选择功能
    changeBodyUserSelect('');
  };

  useEffect(() => {
    highLineRef.current = document.createElement('div');
    highLineRef.current.style.cssText = `
      position: fixed;
      z-index: 10000;
      width: 1px;
      height: ${tableRect?.height}px;
      top: ${tableRect?.top}px;
      background: var(--supos-theme-color);
    `;
  }, [tableRect]);

  useEffect(() => {
    if (!thRef.current) return;
    // if (thRef.current.clientWidth) {
    //   changeWidth(thRef.current.clientWidth);
    // }
    const tableContainer: any = thRef.current.closest('.ant-table-container');
    if (!tableContainer) return;
    const updateSize = () => {
      const rect = tableContainer.getBoundingClientRect();
      setTableRect(rect);
    };
    // 初始化尺寸
    updateSize();
    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(tableContainer);
    // 监听滚动事件
    const scrollParents = findScrollParents(tableContainer);
    const handleScroll = () => {
      updateSize(); // 滚动时更新位置
    };

    scrollParents.forEach((parent: any) => {
      if (parent instanceof Window) {
        window.addEventListener('scroll', handleScroll, { passive: true });
      } else {
        parent.addEventListener('scroll', handleScroll, { passive: true });
      }
    });
    return () => {
      resizeObserver.disconnect();
      scrollParents.forEach((parent: any) => {
        if (parent instanceof Window) {
          window.removeEventListener('scroll', handleScroll);
        } else {
          (parent as HTMLElement).removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!highLineRef.current || !tableRect) return;
    // 动态更新高亮线位置
    highLineRef.current.style.height = `${tableRect.height}px`;
    highLineRef.current.style.top = `${tableRect.top}px`;
  }, [tableRect]);

  return (
    <th {...restProps} ref={thRef} title={Array.isArray(children) && children.length > 1 ? children[1] : undefined}>
      {children}

      <div className="react-resizable-line" onMouseDown={handleMouseDown} />
    </th>
  );
};

const colorObj: any = {
  blue: {
    light: '#E8F1FF',
    dark: '#061833',
  },
  chartreuse: {
    light: '#F0FBD2',
    dark: '#242F06',
  },
};
const ProTable: React.FC<ATableProps> = ({
  resizeable,
  columns,
  components,
  scroll,
  className,
  hiddenEmpty,
  pagination,
  fixedPosition,
  ...restProps
}) => {
  const formatMessage = useTranslate();
  const { theme, primaryColor } = useThemeStore((state) => ({
    theme: state.theme,
    primaryColor: state.primaryColor,
  }));
  const selectBgColor = colorObj?.[primaryColor]?.[theme];

  const [resizeColumns, setResizeColumns] = useState<TableColumnsType>(columns);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef(0);

  const newPagination = pagination
    ? {
        total: pagination?.total,
        showTotal: (total: number) => `${formatMessage('common.total')}  ${total}  ${formatMessage('common.items')}`,
        style: { display: 'flex', justifyContent: 'flex-end', padding: '10px 0' },
        pageSize: 20,
        showQuickJumper: true,
        ...pagination,
      }
    : pagination;

  // 计算有效列宽总和（排除固定列的潜在样式误差）
  const calculateEffectiveWidth = (cols: TableColumnsType) => {
    return cols.reduce((sum, col) => {
      let width = typeof col.width === 'number' ? col.width : 0;
      // 修正固定列的边框误差
      if (col.fixed) width += 2; // 补偿Ant Design的固定列边框
      return sum + width;
    }, 0);
  };

  // 智能选择目标列
  const findFlexColumn = (cols: TableColumnsType) => {
    // 从右向左查找第一个非固定列
    for (let i = cols.length - 1; i >= 0; i--) {
      if (!cols[i].fixed) return i;
    }
    // 全固定列时选择倒数第二列
    return Math.max(0, cols.length - 2);
  };

  // 动态平衡列宽
  const balanceColumns = (cols: TableColumnsType, changedIndex?: number) => {
    const containerWidth = containerWidthRef.current;
    if (!containerWidth) return cols;
    // 新增：预留滚动条宽度
    const SCROLLBAR_WIDTH = 17;
    const totalWidth = calculateEffectiveWidth(cols);
    const delta = containerWidth - totalWidth - SCROLLBAR_WIDTH - (restProps?.rowSelection ? 35 : 0);

    // 当列宽总和不足时自动扩展
    if (delta > 0) {
      const targetIndex = findFlexColumn(cols);
      const newColumns = [...cols];
      newColumns[targetIndex] = {
        ...newColumns[targetIndex],
        width: (newColumns[targetIndex].width as number) + delta,
      };
      return newColumns;
    }

    // 处理主动缩小时同步调整固定列
    if (changedIndex !== undefined && cols[changedIndex]?.fixed) {
      const newColumns = [...cols];
      const nextIndex = changedIndex + 1;
      if (nextIndex < cols.length && !cols[nextIndex].fixed) {
        newColumns[nextIndex] = {
          ...newColumns[nextIndex],
          width: (newColumns[nextIndex].width as number) - delta,
        };
      }
      return newColumns;
    }
    return cols;
  };

  const handleResize = (index: number) => (width?: number) => {
    if (!width || !tableWrapRef.current) return;

    // 1：更新当前列宽
    const newColumns = [...resizeColumns];
    newColumns[index] = { ...newColumns[index], width };

    // 2：智能平衡列宽
    const balancedColumns = balanceColumns(newColumns, index);

    // 3：同步固定列样式
    balancedColumns.forEach((col) => {
      if (col.fixed) {
        const selector = col.fixed === 'right' ? '.ant-table-cell-fix-right' : '.ant-table-cell-fix-left';
        document.querySelectorAll(selector).forEach((el) => {
          const cell = el as HTMLElement;
          if (cell.textContent === col.title?.toString()) {
            cell.style.width = `${col.width}px`;
          }
        });
      }
    });

    setResizeColumns(balancedColumns);
  };

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerWidthRef.current = entries[0].contentRect.width;
        setResizeColumns((prev) => balanceColumns(prev));
      }
    });

    if (tableWrapRef.current) {
      observer.observe(tableWrapRef.current);
      containerWidthRef.current = tableWrapRef.current.clientWidth;
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tableWrapRef.current) {
      const tableElementWidth = (tableWrapRef?.current?.querySelector('.ant-table') as HTMLElement)?.clientWidth;
      const newColumns = resizeColumns.map((col) => {
        return typeof col.width === 'string'
          ? {
              ...col,
              width: col.width.includes('%') ? tableElementWidth * (parseFloat(col.width) / 100) : col.width,
            }
          : col;
      });
      setResizeColumns(newColumns);
    }
  }, [tableWrapRef.current]);

  const mergedColumns = resizeColumns.map<TableColumnsType[number]>((col, index) => ({
    ...col,
    onHeaderCell: (column: TableColumnsType[number]) => ({
      width: column.width,
      minWidth: column.minWidth,
      changeWidth: handleResize(index),
    }),
  }));
  const _classNames = classNames(className, 'pro-table', {
    'resizable-table': resizeable,
    'hidden-empty': hiddenEmpty && restProps?.dataSource?.length === 0,
    'fixed-pagination-bottom': fixedPosition,
  });
  return resizeable ? (
    <div
      ref={tableWrapRef}
      style={{
        '--supos-table-select-bg-color': selectBgColor,
      }}
    >
      <Table
        rowKey="id"
        size={'small'}
        {...restProps}
        className={_classNames}
        columns={mergedColumns}
        pagination={newPagination}
        scroll={{
          x: 'max-content',
          ...scroll,
        }}
        components={{ ...components, header: { cell: ResizableTitle } }}
        tableLayout="fixed"
      />
    </div>
  ) : (
    <Table
      rowKey="id"
      size={'small'}
      {...restProps}
      className={_classNames}
      components={components}
      scroll={scroll}
      columns={columns}
      pagination={newPagination}
    />
  );
};

export default ProTable;
