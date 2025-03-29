import { FC } from 'react';
import { Form, Input, Button, Divider, InputNumber } from 'antd';
import { ChevronLeft } from '@carbon/icons-react';
import { addServer } from '@/apis/inter-api/protocol';
import { useTranslate } from '@/hooks';
import CustomServerForm from './CustomServerForm';
import { FIXED_PROTOCOLS } from '@/pages/uns/components/use-create-modal/CONST';
import { ensureUrlProtocol, getSearchParamsArray } from '@/utils';

const AddServer: FC<any> = ({ modalType, serverDetail, setModalType, protocolName, getServers, restApiForm }) => {
  const [form] = Form.useForm();
  const formatMessage = useTranslate();

  const Update = async () => {
    try {
      const info = await form.validateFields();
      try {
        // 处理url，自动设置
        const _url = new URL(ensureUrlProtocol(info.server.host));
        if (protocolName === 'rest') {
          const _protocol = restApiForm.getFieldsValue(true)?.protocol || {};
          const paramsList = getSearchParamsArray(_url.searchParams);
          restApiForm.setFieldValue('protocol', {
            ..._protocol,
            method: paramsList?.length > 0 ? 'get' : _protocol.method,
            https: _url.protocol === 'https:',
            path: _url?.pathname,
            params: paramsList?.length > 0 ? paramsList : _protocol.params,
            serverName: info.serverName,
          });
        }
        let reqParams = { ...info, server: { ...info?.server, host: _url?.hostname }, protocolName };
        if (protocolName === 'opcda') {
          // 特殊处理opcda
          reqParams = { ...info, protocolName };
        }
        await addServer(reqParams);
        setModalType('');
        getServers(protocolName);
      } catch (e) {
        console.log(e);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const commonRules = {
    rules: [
      {
        required: true,
        message: '',
      },
    ],
  };
  const isAdd = modalType === 'addServer';

  const onHostBlur = () => {
    if (protocolName === 'rest') {
      const server = form.getFieldValue('server');
      try {
        const _url = new URL(ensureUrlProtocol(server?.host));
        if (_url?.port !== 'undefined' && _url?.port) {
          form.setFieldValue('server', { ...server, port: _url?.port });
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className="addServerWrap">
      <Form
        name="serverForm"
        form={form}
        colon={false}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign="left"
        disabled={!isAdd}
        labelWrap
      >
        <Form.Item name="serverName" label={formatMessage('common.serverName')} {...commonRules}>
          {isAdd ? <Input /> : <div>{serverDetail?.serverName}</div>}
        </Form.Item>
        <Divider style={{ borderColor: '#c6c6c6' }} />
        {FIXED_PROTOCOLS.includes(protocolName) ? (
          <>
            <Form.Item name={['server', 'host']} label={formatMessage('common.host')} {...commonRules}>
              {isAdd ? (
                <Input onBlur={onHostBlur} placeholder={protocolName === 'opcda' ? '127.0.0.1' : ''} />
              ) : (
                <div>{serverDetail?.server?.host}</div>
              )}
            </Form.Item>
            {!['opcda', 'icmp']?.includes(protocolName) && (
              <Form.Item name={['server', 'port']} label={formatMessage('common.port')}>
                {isAdd ? <Input /> : <div>{serverDetail?.server?.port}</div>}
              </Form.Item>
            )}
          </>
        ) : (
          <CustomServerForm protocolName={protocolName} isAdd={isAdd} serverDetail={serverDetail} />
        )}
        {protocolName === 'opcua' && (
          <Form.Item name={['server', 'location']} label={formatMessage('uns.location')}>
            {isAdd ? <Input /> : <div>{serverDetail?.server?.location}</div>}
          </Form.Item>
        )}
        {protocolName === 'mqtt' && (
          <>
            <Form.Item name={['server', 'username']} label={formatMessage('appGui.username')}>
              {isAdd ? <Input /> : <div>{serverDetail?.server?.username}</div>}
            </Form.Item>
            <Form.Item name={['server', 'password']} label={formatMessage('appGui.password')}>
              {isAdd ? <Input /> : <div>{serverDetail?.server?.password}</div>}
            </Form.Item>
          </>
        )}
        {protocolName === 'opcda' && (
          <>
            <Form.Item name={['server', 'domain']} label={formatMessage('uns.domain')}>
              {isAdd ? <Input /> : <div>{serverDetail?.server?.domain}</div>}
            </Form.Item>
            <Form.Item name={['server', 'account']} label={formatMessage('uns.account')} {...commonRules}>
              {isAdd ? <Input /> : <div>{serverDetail?.server?.account}</div>}
            </Form.Item>
            <Form.Item name={['server', 'password']} label={formatMessage('uns.password')} {...commonRules}>
              {isAdd ? <Input.Password /> : <div>{serverDetail?.server?.password?.replace(/./g, '*')}</div>}
            </Form.Item>
            <Form.Item name={['server', 'clsid']} label={formatMessage('uns.clsid')} {...commonRules}>
              {isAdd ? <Input /> : <div>{serverDetail?.server?.clsid}</div>}
            </Form.Item>
            <Form.Item
              name={['server', 'timeout']}
              label={formatMessage('uns.timeout')}
              initialValue={5000}
              {...commonRules}
            >
              {isAdd ? (
                <InputNumber min={0} step="1" addonAfter={formatMessage('uns.millisecond')} />
              ) : (
                <div>
                  {serverDetail?.server?.timeout} {formatMessage('uns.millisecond')}
                </div>
              )}
            </Form.Item>
          </>
        )}
      </Form>
      <Divider style={{ borderColor: '#c6c6c6' }} />
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
        {isAdd && (
          <Button color="primary" variant="solid" size="small" onClick={Update}>
            {formatMessage('common.save')}
          </Button>
        )}
      </div>
    </div>
  );
};
export default AddServer;
