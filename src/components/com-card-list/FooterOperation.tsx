import './index.scss';
import { FC } from 'react';
import { AuthWrapper } from '../auth';

const colorList = [
  {
    type: 'blue',
    style: {
      '--hover-color': 'var(--supos-theme-button-hover-color)',
      '--active-color': 'var(--supos-theme-button-active-color)',
      '--common-color': 'var(--supos-theme-color)',
    },
  },
  {
    type: 'block',
    style: {
      '--hover-color': '#000',
      '--active-color': '#303235',
      '--common-color': 'var(--supos-text-color)',
    },
  },
];

export interface FooterOperationProps {
  options?: {
    label: string;
    onClick: (item: any) => void;
    type: string;
    auth?: string | string[];
  }[];
  record?: any;
}

const FooterOperation: FC<FooterOperationProps> = ({ options, record }) => {
  return (
    <div className="footer-operation">
      {options?.map((item: any) => (
        <AuthWrapper auth={item.auth} key={item.label}>
          <div
            style={colorList?.find((f) => f.type === item.type)?.style}
            className="item"
            onClick={() => item?.onClick?.(record, item)}
          >
            {item.label}
          </div>
        </AuthWrapper>
      ))}
    </div>
  );
};

export default FooterOperation;
