import { PageProps } from '@/common-types.ts';
import IframeWrapper from '@/components/iframe-wrapper';
import { FC } from 'react';

const AppIframe: FC<PageProps> = ({ location }) => {
  const { state } = location || {};

  return <IframeWrapper title={state?.title} src={state?.src} />;
};

export default AppIframe;
