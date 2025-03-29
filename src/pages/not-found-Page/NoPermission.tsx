// import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
// import { useRoutesContext } from '@/contexts/routes-context';
import { observer } from 'mobx-react-lite';
import { useTranslate } from '@/hooks';

const NotFoundPage = () => {
  // const routesStore = useRoutesContext();
  const formatMessage = useTranslate();
  const navigate = useNavigate();
  // const { pathname } = useLocation();
  // if (routesStore.routes.some((s) => '/' + s.name === pathname)) {
  //   // 如果是动态路由过来的数据，跳转到uns页
  //   return <Navigate to="/home" replace />;
  // }
  return (
    <Result
      status="403"
      title={403}
      subTitle={<span style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.pageNoPermission')}</span>}
      extra={
        <Button
          type="primary"
          onClick={() => {
            navigate('/home');
          }}
        >
          {formatMessage('common.goHome')}
        </Button>
      }
    />
  );
};

export default observer(NotFoundPage);
