import { FC, useEffect, useState } from 'react';
import { Add, Information, TrashCan } from '@carbon/icons-react';
import { Form, Select, Button, Space, Divider, Flex } from 'antd';
import ModbusFormList from './timeSeries/ModbusFormList';
import OpcuaFormList from './timeSeries/OpcuaFormList';
import OpcdaFormList from './timeSeries/OpcdaFormList';
import RestApiFormList from './relational/RestApiFormList';
import CalculationForm from './timeSeries/CalculationForm';
import MqttForm from './relational/MqttForm';
import { deleteServer, getProtocolList, deleteProtocol } from '@/apis/inter-api/protocol';
import { ComPopupGuide, ComCheckbox } from '@/components';
import { useTranslate } from '@/hooks';
import CustomProtocolForm from './timeSeries/CustomProtocolForm';
import AggForm from './timeSeries/AggForm';
import TagSelect from '@/pages/uns/components/use-create-modal/components/TagSelect';
import _ from 'lodash';
import { FIXED_PROTOCOLS } from '@/pages/uns/components/use-create-modal/CONST';
import IcmpFormList from './timeSeries/IcmpFormList';
import { useRoutesContext } from '@/contexts/routes-context.ts';

const Step2: FC<any> = ({
  types,
  setModalType,
  serverList,
  getServers,
  setServerDetail,
  addNamespaceForAi,
  setAddNamespaceForAi,
  customProtocolData,
  setCustomProtocolData,
  serverConn,
  setServerConn,
}) => {
  const { dashboardType } = useRoutesContext();
  const [protocolList, setProtocolList] = useState<any>([]);
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();

  const protocol = (Form.useWatch('protocol', form) || form.getFieldValue('protocol'))?.protocol;
  const serverName = Form.useWatch(['protocol', 'serverName'], form);
  const dataType = Form.useWatch('dataType', form) || form.getFieldValue('dataType');
  const calculationType = Form.useWatch('calculationType', form) || form.getFieldValue('calculationType');
  const windowType =
    Form.useWatch(['streamOptions', 'window', 'windowType'], form) ||
    form.getFieldValue(['streamOptions', 'window', 'windowType']);

  const commonRules = (message: any) => {
    return {
      rules: [
        {
          required: true,
          message,
        },
      ],
    };
  };

  const getProtocolForm = (protocol: any) => {
    if (!protocol) return null;
    const serverDetail =
      serverList.find((item: any) => item.serverName === form.getFieldValue(['protocol', 'serverName'])) || null;
    switch (protocol) {
      case 'modbus':
        return (
          <ModbusFormList
            addNamespaceForAi={addNamespaceForAi}
            setAddNamespaceForAi={setAddNamespaceForAi}
            commonRules={commonRules}
            serverDetail={serverDetail}
            types={types}
          />
        );
      case 'opcua':
        return <OpcuaFormList commonRules={commonRules} serverDetail={serverDetail} types={types} />;
      case 'opcda':
        return <OpcdaFormList commonRules={commonRules} />;
      case 'rest':
        return <RestApiFormList commonRules={commonRules} />;
      case 'mqtt':
        return <MqttForm serverDetail={serverDetail} />;
      case 'icmp':
        return <IcmpFormList />;
      default:
        return (
          <CustomProtocolForm
            customProtocolData={customProtocolData}
            serverList={serverList}
            deleteServerOption={deleteServerOption}
            setServerDetail={setServerDetail}
            setModalType={setModalType}
            serverConn={serverConn}
            setServerConn={setServerConn}
            protocol={protocol}
          />
        );
    }
  };

  const deleteServerOption = async (e: any, option: any) => {
    e.stopPropagation();
    const { serverName, id } = option || {};
    await deleteServer(id);
    if (form.getFieldValue(['protocol', 'serverName']) === serverName) {
      form.setFieldValue(['protocol', 'serverName'], undefined);
      setServerDetail(null);
    }
    getServers(protocol);
  };

  const deleteProtocolOption = async (e: any, protocolName: any) => {
    e.stopPropagation();
    await deleteProtocol(protocolName);
    if (form.getFieldValue(['protocol', 'protocol']) === protocolName) {
      form.setFieldValue(['protocol', 'protocol'], undefined);
    }
    getProtocols();
  };

  const addProtocol = () => {
    setModalType('addProtocol');
  };

  const getProtocols = async () => {
    const protocols: any = await getProtocolList();
    if (protocols) {
      const _protocols = protocols.map((e: any) => {
        // 接口返回数据调整：['mqtt','modbus',...] => [{name: 'mqtt', dispalyName: 'mqtt'},...]
        return {
          label: e?.displayName ?? e,
          value: e?.name ?? e,
        };
      });
      setProtocolList(_protocols);
    }
  };

  useEffect(() => {
    if (dataType === 3 && calculationType === 4) {
      form.setFieldValue('save2db', true);
    }
    switch (dataType) {
      case 1:
        getProtocols();
        break;
      case 2:
        setProtocolList([
          { value: 'rest', label: 'Rest Api' },
          { value: 'mqtt', label: 'mqtt' },
        ]);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (_.isEmpty(customProtocolData)) return;
    const { serverName, serverConn, protocol } = customProtocolData;
    if (serverName && serverConn) {
      //监听来源于新建协议时需要默认选中的服务
      form.setFieldValue(['protocol', serverConn], serverName);
    }
    if (protocol) {
      form.setFieldValue(['protocol', 'protocol'], protocol);
    }
    setCustomProtocolData({});
  }, [customProtocolData]);

  return (
    <>
      <div className="namespaceBox">
        <div className="namespaceLabel">{formatMessage('uns.namespace')}</div>
        <div className="namespaceValue">{form.getFieldValue('topic')}</div>
      </div>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <div className="formBox">
        {dataType === 3 ? (
          calculationType === 3 ? (
            <CalculationForm />
          ) : (
            <AggForm />
          )
        ) : (
          <>
            <Form.Item
              name={['protocol', 'protocol']}
              label={
                <ComPopupGuide
                  currentStep={addNamespaceForAi?.currentStep}
                  steps={addNamespaceForAi?.steps}
                  stepName="protocol"
                  placement="left"
                  onBegin={(_, __, info) => {
                    form.setFieldsValue(info?.value);
                  }}
                  onFinish={(_, nextStepName) => {
                    setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
                  }}
                >
                  {formatMessage('uns.protocols')}
                </ComPopupGuide>
              }
            >
              <Select
                options={protocolList}
                allowClear
                onChange={(e) => {
                  if (FIXED_PROTOCOLS.includes(e)) setServerConn('');
                  form.setFieldValue('protocol', {
                    protocol: e,
                    ...(e === 'rest' && {
                      // pageDef: {
                      //   start: {
                      //     key: 'pageNo',
                      //     value: 1,
                      //   },
                      //   offset: {
                      //     key: 'pageSize',
                      //     value: 20,
                      //   },
                      // },
                      https: false,
                    }),
                  });
                }}
                optionRender={(option: any) => (
                  <Flex align="center" justify="space-between">
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>{option.data.label}</span>
                    {!FIXED_PROTOCOLS.includes(option.data.value) && (
                      <TrashCan onClick={(e) => deleteProtocolOption(e, option.data.value)} />
                    )}
                  </Flex>
                )}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {dataType === 1 ? (
                      <>
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '0 8px 4px', width: '100%' }}>
                          <Button type="text" onClick={addProtocol} block>
                            {formatMessage('uns.addProtocol')}
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              />
            </Form.Item>

            {FIXED_PROTOCOLS.includes(protocol) && (
              <Form.Item
                label={
                  <ComPopupGuide
                    currentStep={addNamespaceForAi?.currentStep}
                    steps={addNamespaceForAi?.steps}
                    stepName="server"
                    placement="left"
                    onBegin={(_, __, info) => {
                      form.setFieldsValue(info?.value);
                    }}
                    onFinish={(_, nextStepName) => {
                      setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
                    }}
                  >
                    {formatMessage('uns.server')}
                  </ComPopupGuide>
                }
                style={{ marginBottom: 0 }}
                required
                // name="protocol"
              >
                <Space
                  style={{
                    display: 'flex',
                  }}
                  align="start"
                >
                  <Form.Item
                    name={['protocol', 'serverName']}
                    // noStyle
                    rules={[
                      {
                        required: true,
                        message: formatMessage('uns.pleaseSelectServer'),
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      allowClear
                      options={serverList}
                      style={{ width: '365px' }}
                      optionRender={(option) => (
                        <Flex align="center" justify="space-between">
                          <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {option.data.serverName}
                          </span>
                          <TrashCan onClick={(e) => deleteServerOption(e, option.data)} />
                        </Flex>
                      )}
                      fieldNames={{
                        label: 'serverName',
                        value: 'serverName',
                      }}
                    />
                  </Form.Item>
                  <Button
                    color="default"
                    variant="filled"
                    icon={<Information />}
                    disabled={!serverName}
                    onClick={() => {
                      const serverDetail =
                        serverList.find(
                          (item: any) => item.serverName === form.getFieldValue(['protocol', 'serverName'])
                        ) || null;
                      setServerDetail(serverDetail);
                      setModalType('viewServer');
                    }}
                    style={{ border: '1px solid #CBD5E1' }}
                  />
                  <Button
                    color="default"
                    variant="filled"
                    icon={<Add />}
                    disabled={!protocol}
                    onClick={() => {
                      setModalType('addServer');
                    }}
                    style={{ border: '1px solid #CBD5E1', color: 'var(--supos-text-color)' }}
                  />
                </Space>
              </Form.Item>
            )}
            {getProtocolForm(protocol)}
          </>
        )}
        <Divider style={{ borderColor: '#c6c6c6' }} />
        <Form.Item name="tags" label={formatMessage('common.label')}>
          <TagSelect />
        </Form.Item>
        {protocol !== 'icmp' && (
          <>
            <Divider style={{ borderColor: '#c6c6c6' }} />
            {dataType !== 3 && (
              <Form.Item
                name="addFlow"
                label={formatMessage('uns.autoFlow')}
                valuePropName="checked"
                initialValue={true}
              >
                <ComCheckbox />
              </Form.Item>
            )}
            {dashboardType?.includes('grafana') && (
              <Form.Item
                name="addDashBoard"
                label={formatMessage('uns.autoDashboard')}
                valuePropName="checked"
                initialValue={true}
              >
                <ComCheckbox />
              </Form.Item>
            )}
            <Form.Item name="save2db" label={formatMessage('uns.persistence')} valuePropName="checked">
              <ComCheckbox disabled={dataType === 3 && calculationType === 4} />
            </Form.Item>
          </>
        )}

        {dataType === 3 && calculationType === 4 && (
          <Form.Item
            name="advancedOptions"
            label={formatMessage('streams.advancedOptions')}
            valuePropName="checked"
            initialValue={false}
          >
            <ComCheckbox
              onChange={() => {
                form.setFieldValue('_advancedOptions', undefined);
              }}
              disabled={windowType === 'COUNT_WINDOW'}
            />
          </Form.Item>
        )}
      </div>
    </>
  );
};
export default Step2;
