import { useRef, useState } from 'react';
import { ComLayout, ComContent } from '@/components';
import { Button, message, Modal, Tabs, TabsProps, Typography } from 'antd';
import OverviewList from '@/pages/home/components/OverviewList.tsx';
import { useRoutesContext } from '@/contexts/routes-context';
import { RoutesProps } from '@/stores/types';
import styles from './index.module.scss';
import StickyBox from 'react-sticky-box';
import { useGuideSteps, useTranslate } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { guideSteps } from './guide-steps';
import { observer } from 'mobx-react-lite';
import { queryExamples, installExample, unInstallExample } from '@/apis/inter-api/example';
import { Code, Pin, TemperatureWater } from '@carbon/icons-react';
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

  const routesStore = useRoutesContext();
  const formatMessage = useTranslate();
  const navigate = useNavigate();
  const [exampleDataSource, setExampleDataSource] = useState<RoutesProps[]>([]);
  const [loadingViews, setLoadingViews] = useState<string[]>([]);

  useGuideSteps(guideSteps(navigate, { appTitle: routesStore.systemInfo.appTitle }));

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
            `/dashboards-preview?id=${dashboardId}&type=${dashboardType}&status=preview&name=${dashboardName}`
          );
        }
      }

      data.forEach((item: exampleItemTypes) => {
        const type = exampleTypes[item.type];

        if (!newExamplesMap.has(type)) {
          newExamplesMap.set(type, {
            name: formatMessage(`common.${type}`) || type,
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
            {formatMessage('common.welcome', { appTitle: routesStore.systemInfo?.appTitle })}
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
                label: formatMessage('home.overview'),
                key: 'overview',
                children: (
                  <OverviewList list={routesStore.pickedGroupRoutesForHome?.filter((i) => i?.menu?.url !== '/home')} />
                ),
              },
              {
                label: formatMessage('home.example'),
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

export default observer(Index);
