import { useNavigate } from 'react-router-dom';
import { RoutesProps } from '@/stores/types';
import { App } from 'antd';

const useMenuNavigate = (props: { msg?: string } = {}) => {
  const { msg } = props;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleNavigate = (item?: RoutesProps) => {
    if (!item) {
      message.warning(msg ?? '菜单不存在');
      return;
    }
    if (item.isFrontend) {
      navigate(item.menu!.url);
    } else {
      if (item?.openType !== undefined) {
        const { port, protocol, host, name } = item.service as any;
        const path = item.menu?.url?.split(name)?.[1] || '';
        const realHost = port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
        if (item?.openType === '1') {
          window.open(realHost + path);
        } else if (item?.openType === '2') {
          window.open(item.indexUrl);
        } else {
          navigate(`/${item.key}`, {
            state: {
              url: path,
              name: item.name,
              iframeRealUrl: realHost,
            },
          });
        }
      } else {
        navigate(`/${item.key}`, {
          state: {
            url: item?.menu?.url,
            name: item.name,
            iframeRealUrl:
              item?.menuProtocol && item?.menuHost && item?.menuPort
                ? `${item?.menuProtocol}://${item?.menuHost}:${item?.menuPort}${item?.menu?.url}`
                : undefined,
          },
        });
      }
    }
  };

  return handleNavigate;
};

export default useMenuNavigate;
