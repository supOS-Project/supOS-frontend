import { FC } from 'react';
import { AuthWrapper } from '../auth';
import { Button, ButtonProps } from 'antd';
import './index.scss';

const colorType: any = {
  outlined: {
    color: 'primary',
    variant: 'outlined',
    style: {
      background: 'var(--supos-bg-color)',
    },
  },
  primary: {
    color: 'primary',
    variant: 'solid',
  },
  dark: {
    color: 'default',
    variant: 'solid',
    style: {
      background: 'var(--supos-description-card-color)',
    },
  },
};

export interface OperationProps {
  options?: {
    label: string;
    onClick: (item: any) => void;
    type: 'outlined' | 'primary' | 'dark';
    btnProps?: ButtonProps;
    auth?: string | string[];
    disabled?: (item: any) => boolean;
  }[];
  record?: any;
}

const Operation: FC<OperationProps> = ({ options, record }) => {
  return (
    <div className="right-operation">
      {options?.map((item: any) => (
        <AuthWrapper auth={item.auth} key={item.label}>
          <Button
            {...(colorType[item.type] || colorType.outlined)}
            {...item.btnProps}
            disabled={item.disabled ? item.disabled(record) : false}
            className="button-item"
            onClick={() => !(item?.disabled ? item.disabled(record) : false) && item?.onClick?.(record, item)}
          >
            {item.label}
          </Button>
        </AuthWrapper>
      ))}
    </div>
  );
};

export default Operation;
