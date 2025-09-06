import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties, FC } from 'react';
import { SortableTreeItemProps } from '../type.ts';
import { TreeItem } from './TreeItem';
import { iOS } from '../utils.ts';

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) => !(isSorting || wasDragging);

export const SortableTreeItem: FC<SortableTreeItemProps> = ({ id, depth, ...restProps }) => {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled: restProps.disabled,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={restProps.disabled ? undefined : setDraggableNodeRef}
      wrapperRef={restProps.disabled ? undefined : setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...restProps}
    />
  );
};
