import { useTranslate } from '@/hooks';
import styles from './index.module.scss';
import { Typography } from 'antd';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ComMenuList from '@/components/com-menu-list';
import { useBaseStore } from '@/stores/base';
const { Title, Paragraph } = Typography;

const Index = () => {
  const formatMessage = useTranslate();
  const { containerList, systemInfo } = useBaseStore((state) => ({
    containerList: state.containerList,
    systemInfo: state.systemInfo,
  }));
  return (
    <ComLayout>
      <ComContent title={<div></div>} hasBack={false} mustShowTitle={false}>
        <div className={styles['home-title']} style={{ borderBottom: '1px solid var(--supos-home-border-color)' }}>
          <Title style={{ fontWeight: 400, marginBottom: 5 }} type="secondary" level={2}>
            {formatMessage('aboutus.aboutus')}
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            {formatMessage('aboutus.overview', { appTitle: systemInfo.appTitle })}
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            {formatMessage('aboutus.overview2', { appTitle: systemInfo.appTitle })}
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

export default Index;
