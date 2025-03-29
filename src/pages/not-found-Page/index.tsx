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
      status="404"
      title={<span style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.notFound')}</span>}
      subTitle={<span style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.pageNotFound')}</span>}
      style={{ backgroundColor: 'var(--supos-bg-color)' }}
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
