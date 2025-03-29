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
      navigate(`/${item.key}`, {
        state: {
          url: item?.menu?.url,
          name: item.name,
          iframeRealUrl:
            item?.menuProtocol && item?.menuHost && item?.menuPort
              ? `${item?.menuProtocol}://${item?.menuHost}:${item?.menuPort}`
              : undefined,
        },
      });
    }
  };

  return handleNavigate;
};

export default useMenuNavigate;
