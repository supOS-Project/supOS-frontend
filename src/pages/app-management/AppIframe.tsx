import { IframeWrapper } from '@/components';
import { PageProps } from '@/common-types.ts';
import { FC } from 'react';

const AppIframe: FC<PageProps> = ({ location }) => {
  const { state } = location || {};

  return <IframeWrapper title={state?.title} src={state?.src} />;
};

export default AppIframe;
