import { CSSProperties, FC, ReactNode } from 'react';
import { Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DrillBack } from '@carbon/icons-react';
import classNames from 'classnames';
import { useThemeContext } from '@/contexts/theme-context';
import { useTranslate } from '@/hooks';
import { observer } from 'mobx-react-lite';
import styles from './index.module.scss';

export interface ComContentProps {
  border?: boolean;
  hasPadding?: boolean;
  children?: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  style?: CSSProperties;
  hasBack?: boolean;
  backPath?: any;
  wrapperStyle?: CSSProperties;
  className?: string;
  mustShowTitle?: boolean;
  mustHasBack?: boolean;
}

const ComContent: FC<ComContentProps> = ({
  border = true,
  hasPadding,
  children,
  title,
  extra,
  style,
  hasBack = true,
  mustShowTitle = true,
  mustHasBack = true,
  backPath = -1,
  wrapperStyle,
  className,
}) => {
  const navigate = useNavigate();
  const themeStore = useThemeContext();
  const noTitle = mustShowTitle || !themeStore.isTop;
  const noBack = mustHasBack || !themeStore.isTop;
  const formatMessage = useTranslate();

  return (
    <div className={classNames(styles['com-content'], className)} style={wrapperStyle}>
      {noTitle && title && (
        <div
          style={{ paddingLeft: hasPadding && !themeStore.isTop ? 300 : 25, ...(border ? {} : { border: 'none' }) }}
          className="title"
        >
          <div style={{ flex: 1 }}>{title}</div>
          {extra}
          {noBack && hasBack && (
            <Tooltip placement="bottom" title={formatMessage('common.back')}>
              <Button onClick={() => navigate(backPath)} type="primary" icon={<DrillBack style={{ marginTop: 2 }} />}>
                {formatMessage('common.back')}
              </Button>
            </Tooltip>
          )}
        </div>
      )}
      <div className="content" style={style}>
        {children}
      </div>
    </div>
  );
};

export default observer(ComContent);
