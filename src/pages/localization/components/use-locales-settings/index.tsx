import { useState } from 'react';
import ProModal from '@/components/pro-modal';
import useTranslate from '@/hooks/useTranslate.ts';
import { ConfigProvider, Divider, Flex, Form, Input, Select, Switch, Tabs } from 'antd';
import ProSearch from '@/components/pro-search';
import ComDot from '@/components/com-dot';
import './index.scss';
import { AuthButton } from '@/components';
import { Attachment, Download, TrashCan } from '@carbon/icons-react';
import ComDraggerUpload from '@/components/com-dragger-upload';

const TabLabel = ({ id }: { id: string }) => {
  const formatMessage = useTranslate();
  if (id === 'add')
    return (
      <Flex gap={8} style={{ color: '#6F6F6F' }}>
        +<span>{formatMessage('Localization.addLanguage')}</span>
      </Flex>
    );
  return <ComDot>123</ComDot>;
};

const TabContent = () => {
  const [form] = Form.useForm();
  const formatMessage = useTranslate();
  const info = [
    {
      name: 'language',
      label: 'language',
      type: 'readInput',
    },
    {
      name: 'language1',
      label: 'language',
      type: 'readInput',
    },
    {
      name: 'language2',
      label: 'language',
      type: 'readInput',
    },
    {
      name: 'language3',
      label: 'language',
      type: 'readInput',
    },
    {
      name: 'enabled',
      label: 'enabled',
      type: 'checked',
      valuePropName: 'checked',
    },
  ];
  return (
    <div>
      <ConfigProvider
        theme={{
          components: {
            Form: {
              itemMarginBottom: 8,
            },
          },
        }}
      >
        <Form
          labelAlign="left"
          colon={false}
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            language: 'en',
          }}
        >
          {info.map((item) => {
            const { type, ...itemConfig } = item;
            return (
              <Form.Item key={item.name} {...itemConfig}>
                {type === 'readInput' ? <Input readOnly variant="borderless" /> : <Switch />}
              </Form.Item>
            );
          })}
        </Form>
      </ConfigProvider>
      <Divider style={{ backgroundColor: '#BBB' }} />
      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}>{formatMessage('Localization.languagePack')}</div>
      <Flex align="center" justify="space-between" gap={8} style={{ marginBottom: 60 }}>
        <Flex align="center" style={{ flex: 1, opacity: 0.8 }} gap={8}>
          <Attachment />
          <span>BABABABABA</span>
        </Flex>
        <Download style={{ cursor: 'pointer' }} />
      </Flex>
      <Flex justify="flex-end">
        <AuthButton
          icon={
            <Flex align="center">
              <TrashCan />
            </Flex>
          }
        />
      </Flex>
    </div>
  );
};

const AddContent = () => {
  const formatMessage = useTranslate();
  return (
    <div>
      <Flex style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }} justify="space-between">
        <span>{formatMessage('Localization.languagePack')}</span>
        <Flex align="center" style={{ cursor: 'pointer' }}>
          <Download />
          <span>{formatMessage('common.downloadTemplate')}</span>
        </Flex>
      </Flex>
      <ComDraggerUpload
        onChange={(v) => {
          console.log(v);
        }}
      />
      <AuthButton color="primary" variant="solid" block style={{ marginTop: '65px' }}>
        {formatMessage('common.save')}
      </AuthButton>
    </div>
  );
};

const useLocalesSettings = () => {
  const formatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const onLocalesModalOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const LocalesModal = (
    <ProModal
      size="xs"
      className="use-locales-settings"
      open={open}
      title={formatMessage('Localization.localesSetting')}
      onCancel={onClose}
    >
      <Flex gap={8} align="center" style={{ marginBottom: 16 }}>
        <span>{formatMessage('Localization.defaultLanguage')}</span>
        <Select
          placeholder={formatMessage('common.select')}
          variant="borderless"
          style={{ width: 100 }}
          options={[
            { value: 'jack', label: 'Jack' },
            { value: 'lucy', label: 'Lucy' },
            { value: 'Yiminghe', label: 'yiminghe' },
          ]}
        />
      </Flex>
      <Tabs
        tabBarGutter={0}
        tabBarExtraContent={{
          left: (
            <div style={{ marginRight: 16, marginBottom: 16 }}>
              <ProSearch placeholder={formatMessage('Localization.searchLanguage')} size="sm" />
            </div>
          ),
        }}
        className="custom-tab"
        tabPosition="left"
        items={[
          ...Array.from({ length: 3 }).map((_, i) => {
            const id = String(i + 1);
            return {
              label: <TabLabel id={id} />,
              key: id,
              children: <TabContent />,
            };
          }),
          {
            label: <TabLabel id="add" />,
            key: 'add',
            children: <AddContent />,
          },
        ]}
      />
    </ProModal>
  );

  return {
    LocalesModal,
    onLocalesModalOpen,
  };
};

export default useLocalesSettings;
