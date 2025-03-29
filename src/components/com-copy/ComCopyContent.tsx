import { FC, ReactNode } from 'react';
import ComCopy from '../com-copy/index';
import { Flex } from 'antd';
import './ComCopyContent.scss';
import classNames from 'classnames';

const ComCopyContent: FC<{ textToCopy?: string; label: ReactNode; labelClassName?: string }> = ({
  textToCopy = ' ',
  label,
  labelClassName,
}) => {
  return (
    <Flex align="center" className="com-copy-content">
      <div className={classNames('label', labelClassName)}>{label}</div>
      <Flex className={'content'} justify="space-between">
        <div className={'text'} title={textToCopy}>
          {textToCopy}
        </div>
        <ComCopy textToCopy={textToCopy} />
      </Flex>
    </Flex>
  );
};

export default ComCopyContent;
