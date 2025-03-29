import { CodeSnippet } from '@carbon/react';
import { useTranslate } from '@/hooks';
import { ComponentProps, CSSProperties, FC, useEffect, useRef } from 'react';
import classNames from 'classnames';
import './index.scss';
import { useSize } from 'ahooks';

type CodeSnippetProps = ComponentProps<typeof CodeSnippet>;

interface ComCodeSnippetProps extends CodeSnippetProps {
  style?: CSSProperties;
  onSizeChange?: (size?: { height: number; width: number }) => void;
  copyPosition?: boolean;
}

const ComCodeSnippet: FC<ComCodeSnippetProps> = ({
  className,
  onSizeChange,
  style,
  copyPosition = true,
  ...restProps
}) => {
  const formatMessage = useTranslate();
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);

  useEffect(() => {
    onSizeChange?.(size);
  }, [size]);
  return (
    <div className="com-code-snippet" ref={ref} style={style}>
      <CodeSnippet
        autoAlign
        className={classNames('code-snippet-wrapper', className, { 'com-copy-code-snippet': copyPosition })}
        type="multi"
        minCollapsedNumberOfRows={26}
        maxCollapsedNumberOfRows={26}
        align="top-right"
        showLessText={formatMessage('uns.showLess')}
        showMoreText={formatMessage('uns.showMore')}
        aria-label={formatMessage('uns.copyToClipboard')}
        feedback={formatMessage('uns.copiedToClipboard')}
        copyButtonDescription={formatMessage('uns.copyToClipboard')}
        {...restProps}
      />
    </div>
  );
};

export default ComCodeSnippet;
