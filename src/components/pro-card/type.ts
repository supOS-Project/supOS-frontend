export type SemanticDOM =
  | 'root'
  | 'card'
  | 'statusHeader'
  | 'statusInfo'
  | 'statusTag'
  | 'header'
  | 'title'
  | 'actions';

import { CSSProperties, ReactNode } from 'react';
import { OperationProps } from '@/components/operation-buttons/utils.tsx';

export interface ProCardProps {
  loading?: boolean;
  // 影响hover的样式
  allowHover?: boolean;
  styles?: Partial<Record<SemanticDOM, CSSProperties>>;
  classNames?: Partial<Record<SemanticDOM, string>>;
  value?: boolean;
  onChange?: (e: any) => void;
  statusHeader?: {
    allowCheck?: boolean;
    statusInfo?: {
      label: string;
      color: string;
      title: string;
    };
    statusTag?: ReactNode;
  };
  item?: any;
  onClick?: (item?: any) => void;
  header?: {
    customIcon?: ReactNode;
    iconSrc?: string;
    defaultIconUrl?: string;
    title?: ReactNode;
    titleDescription?: ReactNode;
  };
  description?: string | { content?: string; rows?: number };
  secondaryDescription?: ReactNode;
  actions?: ((item: any) => OperationProps[]) | OperationProps[];
}
