import { getSearchParamsObj } from '@/utils';
import NotFoundPage from '@/pages/not-found-Page';
import './index.scss';

const Share = () => {
  const { url } = getSearchParamsObj(location?.search) || {};

  if (!url) return <NotFoundPage />;

  return <iframe src={decodeURIComponent(url)} style={{ width: '100%', height: '100%', overflow: 'hide' }}></iframe>;
};

export default Share;
