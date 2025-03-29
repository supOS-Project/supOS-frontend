import { ComLayout, ComMenuList, ComContent } from '@/components';
import { useTranslate } from '@/hooks';
import styles from './index.module.scss';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context';
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

const Index = () => {
  const formatMessage = useTranslate();
  const routesStore = useRoutesContext();
  const { containerList } = routesStore;
  return (
    <ComLayout>
      <ComContent title={<div></div>} hasBack={false} mustShowTitle={false}>
        <div className={styles['home-title']} style={{ borderBottom: '1px solid var(--supos-home-border-color)' }}>
          <Title style={{ fontWeight: 400, marginBottom: 5 }} type="secondary" level={2}>
            {formatMessage('aboutus.aboutus')}
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            {formatMessage('aboutus.overview', { appTitle: routesStore.systemInfo.appTitle })}
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            {formatMessage('aboutus.overview2', { appTitle: routesStore.systemInfo.appTitle })}
          </Paragraph>
          {/*<Paragraph style={{ marginBottom: 0 }}>{formatMessage('aboutus.openSourceLicense')}</Paragraph>*/}
        </div>
        <div className={styles['content-section']}>
          <ComMenuList list={containerList?.aboutUs || []} showDescription={false} height="auto" />
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default observer(Index);
