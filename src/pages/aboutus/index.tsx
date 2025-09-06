import { useClipboard, useTranslate } from '@/hooks';
import styles from './index.module.scss';
import { Collapse, theme, Typography } from 'antd';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ComMenuList from '@/components/com-menu-list';
import { useBaseStore } from '@/stores/base';
import { CaretRightOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;

const Index = () => {
  const formatMessage = useTranslate();
  const { containerList, systemInfo } = useBaseStore((state) => ({
    containerList: state.containerList,
    systemInfo: state.systemInfo,
  }));
  const { copy } = useClipboard();
  const { token } = theme.useToken();
  return (
    <ComLayout>
      <ComContent title={<div></div>} hasBack={false} mustShowTitle={false}>
        <div className={styles['home-title']} style={{ borderBottom: '1px solid var(--supos-home-border-color)' }}>
          <Title style={{ fontWeight: 400, marginBottom: 5 }} type="secondary" level={2}>
            {formatMessage('aboutus.aboutus1', { appTitle: systemInfo.appTitle })}
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            {formatMessage('aboutus.overview3', { appTitle: systemInfo.appTitle })}
          </Paragraph>
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{ background: 'var(--supos-uns-button-color)', marginTop: 8 }}
            items={[
              {
                key: '1',
                label: formatMessage('aboutus.more'),
                children: (
                  <>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {formatMessage('aboutus.expectation', { appTitle: systemInfo.appTitle })}
                      <a href="https://www.supos.ai/" target="_blank">
                        www.supos.ai
                      </a>
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {formatMessage('aboutus.question', { appTitle: systemInfo.appTitle })}&nbsp;&nbsp;
                      <a onClick={() => copy('info@freezonex.io')}>info@freezonex.io</a>
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {formatMessage('aboutus.emil', { appTitle: systemInfo.appTitle })}&nbsp;&nbsp;
                      <a href="https://discord.com/invite/K92gcRWabU" target="_blank">
                        https://discord.com/invite/K92gcRWabU
                      </a>
                    </Paragraph>
                  </>
                ),
                style: {
                  background: 'var(--supos-uns-button-color)',
                  borderRadius: token.borderRadiusLG,
                  border: 'none',
                },
              },
            ]}
          />

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
