import { FC, useState } from 'react';
import { Form, Input, Button, Divider, App } from 'antd';
import { ChevronLeft } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import ImportConfig from './ImportConfig';
import { addProtocol } from '@/apis/inter-api/protocol';

const AddProtocol: FC<any> = ({ setModalType, setCustomProtocolData }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [protocolData, setProtocolData] = useState<any>({});
  const formatMessage = useTranslate();

  const Update = () => {
    form.validateFields().then((values: any) => {
      addProtocol({ name: values.name, ...protocolData }).then((res: any) => {
        message.success(formatMessage('uns.newSuccessfullyAdded'));
        setCustomProtocolData({ protocol: values.name, ...res });
        setModalType('');
      });
    });
  };

  return (
    <div className="addServerWrap">
      <Form
        name="protocolForm"
        form={form}
        colon={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        labelAlign="left"
      >
        <Form.Item
          name="name"
          label={formatMessage('common.name')}
          rules={[
            {
              required: true,
              message: formatMessage('uns.pleaseInputProtocolName'),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage('uns.importConfiguration')}>
          <Button
            type="primary"
            onClick={() => {
              setOpen(true);
            }}
          >
            {formatMessage('common.import')}
          </Button>
        </Form.Item>
        <Divider style={{ borderColor: '#c6c6c6' }} />
        {protocolData?.clientConfig?.length > 0 && (
          <>
            {protocolData?.clientConfig?.map((e: any) => {
              return (
                <Form.Item name={e.name} label={e.name} key={e.name}>
                  <div>{String(e.value)}</div>
                </Form.Item>
              );
            })}
            <Divider style={{ borderColor: '#c6c6c6' }} />
          </>
        )}
      </Form>
      <div className="optBtnWrap">
        <Button
          color="default"
          variant="filled"
          size="small"
          icon={<ChevronLeft />}
          onClick={() => {
            setModalType('');
          }}
        >
          {formatMessage('common.back')}
        </Button>

        <Button color="primary" variant="solid" size="small" onClick={Update}>
          {formatMessage('common.save')}
        </Button>
      </div>
      <ImportConfig open={open} setOpen={setOpen} setProtocolData={setProtocolData} />
    </div>
  );
};
export default AddProtocol;
