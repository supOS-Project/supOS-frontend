import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useBaseStore } from '@/stores/base';

const NotPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const rawRoutes = useBaseStore.getState().rawRoutes;
    const isAuthRoute = rawRoutes?.find((f) => '/' + f.name === pathname || f?.menu?.url === pathname);
    if (isAuthRoute?.name || pathname === '/403') {
      // 如果没权限
      navigate('/403');
    } else {
      // 如果没菜单
      navigate('/404');
    }
  }, [pathname]);

  return <div></div>;
};

export default NotPage;
