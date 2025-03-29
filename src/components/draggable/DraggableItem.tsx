import { useDraggable } from '@dnd-kit/core';
import { Axis } from './index.tsx';
import { CSSProperties, FC, ReactNode } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';
import IframeMask from '../iframe-mask';

interface DraggableItemProps {
  handle?: boolean;
  style?: CSSProperties;
  buttonStyle?: CSSProperties;
  axis?: Axis;
  top?: number;
  left?: number;
  children?: ReactNode;
  draggingId?: string | number;
  onMouseEnter?: (isDragging: boolean) => void;
  onMouseLeave?: (isDragging: boolean) => void;
}

const DraggableItem: FC<DraggableItemProps> = ({
  style,
  top,
  left,
  children,
  draggingId,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useDraggable({
    id: draggingId || 'draggable',
  });
  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onMouseEnter={() => onMouseEnter?.(isDragging)}
        onMouseLeave={() => onMouseLeave?.(isDragging)}
        className={classNames(styles['draggable-item'])}
        style={
          {
            ...style,
            top,
            left,
            position: 'fixed',
            '--translate-x': `${transform?.x ?? 0}px`,
            '--translate-y': `${transform?.y ?? 0}px`,
            cursor: isDragging ? 'move' : 'pointer',
            zIndex: 10,
          } as CSSProperties
        }
      >
        {children}
      </div>
      <IframeMask style={{ display: isDragging ? 'block' : 'none' }} />
    </>
  );
};

export default DraggableItem;
