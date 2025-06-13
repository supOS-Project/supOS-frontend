import { CSSProperties, FC } from 'react';

const IframeWrapper: FC<{ src: string; iframeRealUrl?: string; title: string; style?: CSSProperties }> = ({
  src,
  iframeRealUrl,
  title,
  style,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <iframe
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title={title}
        src={iframeRealUrl ? iframeRealUrl : src}
      ></iframe>
    </div>
  );
};

export default IframeWrapper;
