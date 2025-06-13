import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, message, Modal, Tabs, TabsProps, Typography } from 'antd';
import OverviewList from '@/pages/home/components/OverviewList.tsx';
import { RoutesProps } from '@/stores/types';
import styles from './index.module.scss';
import StickyBox from 'react-sticky-box';
import { useGuideSteps, useTranslate } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { guideSteps } from './guide-steps';
import { queryExamples, installExample, unInstallExample } from '@/apis/inter-api/example';
import { Code, Pin, TemperatureWater } from '@carbon/icons-react';
import { useActivate } from '@/contexts/tabs-lifecycle-context.ts';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import { fetchBaseStore, useBaseStore } from '@/stores/base';
import { useThemeStore } from '@/stores/theme-store.ts';

const { Title, Paragraph } = Typography;

// example 返回的数据结构
interface exampleItemTypes {
  id: number | string;
  name: string;
  description: string;
  status: number;
  type: number;
  dashboardType?: number;
  dashboardId?: string;
  dashboardName?: string;
}

const exampleTypes: { [x: string | number]: string } = {
  1: 'OTDataConnections',
  2: 'ITDataConnections',
};

const Index = () => {
  const selectedIdRef = useRef<string | number>();
  const { pickedGroupRoutesForHome, systemInfo } = useBaseStore((state) => ({
    pickedGroupRoutesForHome: state.pickedGroupRoutesForHome,
    systemInfo: state.systemInfo,
  }));
  const formatMessage = useTranslate();
  const navigate = useNavigate();
  const [pathname, setPathname] = useState('');
  const [exampleDataSource, setExampleDataSource] = useState<RoutesProps[]>([]);
  const [loadingViews, setLoadingViews] = useState<string[]>([]);

  useEffect(() => {
    fetchBaseStore?.();
  }, []);
  const primaryColor = useThemeStore((state) => state.primaryColor);

  // 解决routesStore?.fetchRoutes导致跳转路由方法失效的问题：通过state改变再触发navigate跳转
  const handleNavigate = useCallback((path: string) => {
    setPathname(path);
  }, []);
  useEffect(() => {
    if (pathname) {
      navigate(pathname);
    }
  }, [pathname]);
  useGuideSteps(guideSteps(handleNavigate, { appTitle: systemInfo.appTitle }, primaryColor));

  useActivate(() => {
    // 每次进home页刷新下，保持页面完整
    fetchBaseStore?.();
  });

  // 获取example列表
  const getExamples = (open = true) => {
    queryExamples().then((data: any) => {
      const newExamplesMap = new Map();
      const newExampleDataSource: RoutesProps[] = [];

      if (!data?.length) return;

      // 安装后打开页面
      if (selectedIdRef.current && open) {
        const { dashboardId, dashboardName, dashboardType } = data.find(
          (item: exampleItemTypes) => item.id === selectedIdRef.current
        );
        selectedIdRef.current = undefined;
        if (dashboardId) {
          window.open(
            `/dashboards/preview?id=${dashboardId}&type=${dashboardType}&status=preview&name=${dashboardName}`
          );
        }
      }

      data.forEach((item: exampleItemTypes) => {
        const type = exampleTypes[item.type];

        if (!newExamplesMap.has(type)) {
          newExamplesMap.set(type, {
            name: item.name,
            key: type,
            hasChildren: true,
            children: [],
          });
        }

        newExamplesMap.set(type, {
          ...newExamplesMap.get(type),
          iconComp: <Pin />,
          children: [
            ...newExamplesMap.get(type).children,
            {
              name: item.name,
              isFrontend: false,
              parentName: formatMessage(`common.${type}`) || type,
              parentKey: type,
              key: item.id,
              status: item.status,
              description: item.description,
              iconComp: type === 'OTDataConnections' ? <TemperatureWater color="#1D77FE" /> : <Code color="#1D77FE" />,
            },
          ],
        });
      });

      newExamplesMap.forEach((value) => {
        newExampleDataSource.push(value);
      });

      setExampleDataSource(newExampleDataSource);
    });
  };

  // 安装example
  const handleInstall = (params: RoutesProps) => {
    Modal.confirm({
      title: formatMessage('common.confirmInstall'),
      onOk: () => {
        if (!params.key) return;
        setLoadingViews([...loadingViews, params.key]);
        selectedIdRef.current = params.key;
        installExample(params.key)
          .then(() => {
            message.success(formatMessage('common.installedSuccess'));
            getExamples();
          })
          .finally(() => {
            loadingViews.splice(loadingViews.indexOf(params.key as string), 1);
            setLoadingViews(loadingViews);
          });
      },
    });
  };

  // 卸载example
  const handleUnInstall = (params: RoutesProps) => {
    Modal.confirm({
      title: formatMessage('common.confirmUnInstall'),
      onOk: () => {
        if (!params.key) return;
        setLoadingViews([...loadingViews, params.key]);
        selectedIdRef.current = params.key;
        unInstallExample(params.key)
          .then(() => {
            message.success(formatMessage('common.unInstalledSuccess'));
            getExamples(false);
          })
          .finally(() => {
            loadingViews.splice(loadingViews.indexOf(params.key as string), 1);
            setLoadingViews(loadingViews);
          });
      },
    });
  };

  // 切换tab
  const handleChangeTab = (key: string) => {
    if (key !== 'example') return;
    getExamples();
  };

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox offsetTop={0} offsetBottom={20} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );

  const renderExampleOpt = (params: RoutesProps) => {
    return params.status === 1 ? (
      <Button size="small" type="primary" onClick={() => handleInstall(params)}>
        {formatMessage('common.install')}
      </Button>
    ) : (
      <Button size="small" onClick={() => handleUnInstall(params)}>
        {formatMessage('common.unInstall')}
      </Button>
    );
  };
  return (
    <ComLayout>
      <ComContent title={<div></div>} hasBack={false} mustShowTitle={false}>
        <div className={styles['home-title']}>
          <Title style={{ fontWeight: 400, marginBottom: 5 }} type="secondary" level={2}>
            {formatMessage('common.welcome', { appTitle: systemInfo?.appTitle })}
          </Title>

          <Paragraph style={{ marginBottom: 0 }}>{formatMessage('common.excellence')}</Paragraph>
        </div>
        <div className={styles['home-tabs']}>
          <Tabs
            renderTabBar={renderTabBar}
            defaultActiveKey="overview"
            onChange={handleChangeTab}
            items={[
              {
                label: formatMessage('common.overview'),
                key: 'overview',
                children: <OverviewList list={pickedGroupRoutesForHome?.filter((i) => i?.menu?.url !== '/home')} />,
              },
              {
                label: formatMessage('common.example'),
                key: 'example',
                children: (
                  <OverviewList
                    list={exampleDataSource}
                    loadingViews={loadingViews}
                    type="example"
                    customOptRender={renderExampleOpt}
                  />
                ),
              },
            ]}
          />
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default Index;
