import { forwardRef } from 'react';
import cx from 'classnames';
import { TreeItemProps } from '../type.ts';
import styles from './TreeItem.module.scss';
import { Draggable } from '@carbon/icons-react';

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      wrapperRef,
      style,
      handleProps,
      depth,
      indentationWidth,
      label,
      rightExtra,
      wrapperStyle,
      disabled,
      disableSelection,
      disableInteraction,
      ghost,
      clone,
      indicator,
      allowDrop,
      node,
      onSelect,
      selected,
      ...restProps
    },
    ref
  ) => {
    const className = cx(
      styles.TreeItemWrapper,
      clone && styles.clone,
      ghost && styles.ghost,
      {
        [styles.notAllow]: allowDrop === false,
      },
      selected && styles.selected,
      indicator && styles.indicator,
      disableSelection && styles.disableSelection,
      disableInteraction && styles.disableInteraction
    );
    return (
      <div
        title={typeof label === 'string' ? label : ''}
        ref={wrapperRef}
        {...restProps}
        className={className}
        style={{
          '--spacing': `${indentationWidth * depth}px`,
          ...wrapperStyle,
        }}
        {...handleProps}
        onClick={() => {
          if (selected) {
            onSelect?.();
          } else {
            onSelect?.(node?.id, node);
          }
        }}
      >
        <div ref={ref} style={style} className={styles.TreeItem}>
          {!clone && !disabled && <Draggable style={{ cursor: 'grab', flexShrink: 0 }} {...handleProps} />}
          <div className={styles.Text}>{label}</div>
          {rightExtra && <div className={styles.RightExtra}>{rightExtra}</div>}
        </div>
      </div>
    );
  }
);
