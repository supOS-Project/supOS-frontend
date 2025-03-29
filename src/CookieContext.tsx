import { useCookies } from 'react-cookie';
import { LOGIN_URL, SUPOS_COMMUNITY_TOKEN, SUPOS_USER_TIPS_ENABLE } from '@/common-types/constans';
import { useUpdateEffect } from 'ahooks';
import { message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context';
import { storageOpt } from '@/utils';
import { SUPOS_USER_GUIDE_ROUTES } from '@/common-types/constans';

// 登录失效控制
const CookieContext = () => {
  const routesStore = useRoutesContext();

  const [cookies] = useCookies([SUPOS_COMMUNITY_TOKEN]);

  useUpdateEffect(() => {
    // cookie发生改变删除guide routes信息
    storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
    // cookie发生改变重置tips展示状态
    storageOpt.remove(SUPOS_USER_TIPS_ENABLE);

    if (!cookies?.[SUPOS_COMMUNITY_TOKEN]) {
      if (import.meta.env.MODE === 'development') {
        message.error('开发环境cookie已失效，重新登录生产环境环境，然后复制生产环境的cookie使用');
      } else {
        console.log('登录cookie不存在，要跳转到登录页');
        window.location.href = routesStore?.systemInfo?.loginPath || LOGIN_URL;
      }
    }
  }, [cookies?.[SUPOS_COMMUNITY_TOKEN]]);

  return null;
};

export default observer(CookieContext);
