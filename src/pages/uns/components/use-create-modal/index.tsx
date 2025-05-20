import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Close } from '@carbon/icons-react';
import { Form, App, Button, Divider, Drawer } from 'antd';
import {
  addModel,
  getTypes,
  getInstanceInfo,
  getModelInfo,
  searchRestField,
  makeLabel,
  getAllTemplate,
  addTemplate,
  searchTreeData,
} from '@/apis/inter-api/uns';
import { getServerList } from '@/apis/inter-api/protocol';
import { useTranslate } from '@/hooks';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import AddServer from './modals/AddServer';
import AddProtocol from './modals/AddProtocol';
import { ComPopupGuide } from '@/components';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import _ from 'lodash';
import { noDuplicates, parseArrayToObjects, parseTime, getExpression } from '@/utils';

const useOptionModal = ({
  successCallBack,
  addNamespaceForAi,
  setAddNamespaceForAi,
  changeCurrentPath,
  scrollTreeNode,
  setTreeMap,
}: any) => {
  const { message } = App.useApp();
  const formatMessage = useTranslate();
  const [form] = Form.useForm();
  const [uuid, setUuid] = useState('');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [modalType, setModalType] = useState(''); //addServer,viewServer,addProtocol
  const [serverDetail, setServerDetail] = useState(null);
  const [serverList, setServerList] = useState<any>([]);
  const [dataFieldsObj, setDataFieldsObj] = useState<any>({});
  const [customProtocolData, setCustomProtocolData] = useState<any>({}); //只用来新建协议时回填协议和服务字段，用完即删
  const [serverConn, setServerConn] = useState(''); //自定义协议服务对应的key
  const [addModalType, setAddModalType] = useState<string>(''); //addFolder,addFile
  const [sourcePath, setSourcePath] = useState<string>(''); //文件路径
  const [templateList, setTemplateList] = useState<any>([]); //模版列表

  const protocol = (Form.useWatch('protocol', form) || form.getFieldValue('protocol'))?.protocol;
  const advancedOptions = Form.useWatch('advancedOptions', form);
  const calculationType = Form.useWatch('calculationType', form) || form.getFieldValue('calculationType');
  const dataType = Form.useWatch('dataType', form) || form.getFieldValue('dataType');
  const isCreateFolder = addModalType.includes('Folder');

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    setModalType('');
    setStep(1);
    setLoading(false);
    setAddNamespaceForAi?.(null);
    setCustomProtocolData({});
    setServerConn('');
    setSourcePath('');
  };

  const save = () => {
    form
      .validateFields()
      .then(async () => {
        const {
          topic,
          alias,
          fields,
          dataType,
          modelDescription,
          instanceDescription,
          addFlow,
          addDashBoard,
          save2db,
          protocol,
          calculationType,
          refers,
          expression,
          tags,
          mainKey,
          frequency,
          referTopics,
          modelId,
          name,
          exportTemplate,

          functions,
          DataSource,
          streamOptions,
          whereCondition,
          havingCondition,
          advancedOptions,

          _advancedOptions,
          table,
        } = _.cloneDeep(form.getFieldsValue(true));

        // 表单验证通过后的操作
        const data: any = isCreateFolder
          ? {
              topic,
              alias,
              modelDescription,
              fields,
            }
          : {
              topic,
              alias,
              dataType,
              instanceDescription,
              save2db,
              ...(dataType !== 6 ? { fields, addDashBoard, instanceDescription } : {}),
            };

        if (isCreateFolder && exportTemplate && modelId === 'custom' && fields?.length > 0) {
          const templateData: any = await addTemplate({ path: name, fields });
          if (templateData?.id) data.modelId = templateData?.id;
        } else {
          data.modelId = modelId && modelId !== 'custom' ? modelId : undefined;
        }

        if (!isCreateFolder) {
          if (protocol?.[serverConn || 'serverName']) {
            const selectedServer = serverList.find((e: any) => e.serverName === protocol?.[serverConn || 'serverName']);
            // protocol = { ...protocol, ...selectedServer };
            Object.assign(protocol, selectedServer);
          }
          if (protocol?.protocol) {
            if (protocol.body) {
              protocol.body = JSON.parse(protocol.body);
            }
            data.protocol = protocol;
          }
          if (protocol?.protocol === 'rest') {
            data.dataPath = dataFieldsObj.dataPath;
          }

          switch (dataType) {
            case 1:
            case 2:
              data.addFlow = addFlow;
              if (mainKey > -1) {
                fields[mainKey].unique = true;
              }
              if (table?.value) {
                data.protocol = {
                  ...(data.protocol || {}),
                  referenceDataSource: table.value
                    ?.split?.('$分隔符$')
                    ?.filter((e: any) => e !== 'tables')
                    ?.join('.'),
                };
              }
              break;
            case 3:
              if (calculationType === 3) {
                //实时计算
                data.refers = refers.map((refer: any) => {
                  return { topic: refer.topic, field: refer.field };
                });
                data.expression = expression ? expression.replace(/\$(.*?)#/g, '$1') : '';
              }
              if (calculationType === 4) {
                //历史计算
                data.dataType = 4;

                data.referTopic = DataSource;
                if (functions && Array.isArray(functions) && fields && Array.isArray(fields)) {
                  data.fields = fields.map((field: any, index: number) => {
                    const func = functions[index];
                    return {
                      ...field,
                      index: `${func.functionType}(${func.key})`,
                    };
                  });
                }

                if (whereCondition) streamOptions.whereCondition = whereCondition.replace(/\$(.*?)#/g, '$1');
                if (havingCondition) streamOptions.havingCondition = havingCondition.replace(/\$(.*?)#/g, '$1');

                if (advancedOptions && _advancedOptions) {
                  //高级流选项
                  if (_advancedOptions.trigger === 'MAX_DELAY') {
                    _advancedOptions.trigger = `MAX_DELAY ${_advancedOptions.delayTime}`;
                    delete _advancedOptions.delayTime;
                  }
                  if (_advancedOptions.startTime)
                    _advancedOptions.startTime = dayjs(_advancedOptions.startTime).format('YYYY-MM-DD');
                  if (_advancedOptions.endTime)
                    _advancedOptions.endTime = dayjs(_advancedOptions.endTime).format('YYYY-MM-DD');
                  Object.keys(_advancedOptions).forEach((key: any) => {
                    if (['', undefined, null].includes(_advancedOptions[key])) delete _advancedOptions[key];
                  });
                }
                data.streamOptions = { ...streamOptions, ..._advancedOptions };
              }
              break;
            case 6:
              Object.assign(data, {
                frequency: frequency.value + frequency.unit,
                referTopics,
              });
              break;
            default:
              break;
          }
        }

        const allowAddName = fields ? noDuplicates(fields.map((e: any) => e.name)) : true;
        const allowAddIndex =
          dataType === 1 && protocol?.protocol && fields
            ? noDuplicates(fields.map((e: any) => e.index).filter((i: any) => i))
            : true;

        if (allowAddName && allowAddIndex) {
          setLoading(true);
          const icmpParams =
            data?.protocol?.protocol === 'icmp'
              ? {
                  addDashBoard: false,
                  addFlow: true,
                  save2db: false,
                }
              : {};

          const handleCallback = (data: any, type: number) => {
            successCallBack({}, () => {
              changeCurrentPath({ path: data.topic, type });
              setTreeMap(false);
              scrollTreeNode(data.topic);
            });
          };
          addModel({ ...data, ...icmpParams })
            .then(() => {
              message.success(formatMessage('uns.newSuccessfullyAdded'));
              if (isCreateFolder) {
                handleCallback(data, 0);
              } else {
                makeLabel(
                  data.alias,
                  tags?.map(({ label, value }: any) => ({ ...(label ? { id: value } : { labelName: value }) })) || []
                ).then(() => {
                  handleCallback(data, 2);
                });
              }
              onClose();
            })
            .catch((err) => {
              setLoading(false);
              console.log(err);
              setAddNamespaceForAi?.(null);
            })
            .finally(() => {
              if (isCreateFolder && addNamespaceForAi) {
                // 如果是新增文件的
                setTimeout(() => {
                  setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: 'openFileNewModal' });
                }, 500);
              }
            });
        } else {
          message.error(
            `${formatMessage('uns.thereAreDuplicate')} ${!allowAddName && !allowAddIndex ? formatMessage('uns.namesAndNums') : !allowAddName ? formatMessage('uns.keyName') : formatMessage('uns.nums')}!`
          );
        }
      })
      .catch((info) => {
        console.log('校验失败:', info);
        const firstErrName = info?.errorFields?.[0]?.name;
        form.scrollToField(firstErrName, { behavior: 'smooth' });
        // 表单验证失败后的操作
      })
      .finally(() => {
        if (addNamespaceForAi) {
          setAddNamespaceForAi?.(null);
        }
      });
  };

  const handleStep = async () => {
    return form.validateFields().then(() => {
      const attributeType = form.getFieldValue('attributeType');
      const next = form.getFieldValue('next');
      if (attributeType === 3 && !next) {
        message.error(formatMessage('uns.noFieldsTip'));
        return;
      }
      if (step === 2) {
        if (calculationType === 4 && advancedOptions) {
          setStep(() => step + 1);
        } else {
          getDataFields();
        }
      } else {
        setStep(() => step + 1);
      }
    });
  };

  const handleMockNextStep = async (customStep: number) => {
    setStep(() => customStep);
  };

  //从RestApi搜系模型字段
  const getDataFields = async () => {
    const { fields, protocol } = form.getFieldsValue(true);
    const { method, path, params, serverName, pageDef, https, headers, body } = protocol;

    const searchParams: any = {
      headers,
      fields,
      pageDef,
      method,
      path,
      https,
    };
    switch (method) {
      case 'get':
        searchParams.params = params;
        break;
      case 'post':
        searchParams.body = JSON.parse(body || '{}');
        break;
      default:
        break;
    }
    const server = serverList.find((e: any) => e.serverName === serverName);
    if (!server) {
      message.error(formatMessage('uns.serverDeletedTip'));
      return;
    }
    searchParams.server = server.server;
    const data: any = await searchRestField(searchParams);
    const dataFields = (data?.dataFields || []).map((e: any) => {
      return {
        label: e,
        value: e,
      };
    });
    setDataFieldsObj({ ...data, dataFields });
    setStep(() => step + 1);
  };

  const getServers = (protocolName: any) => {
    getServerList({ k: protocolName })
      .then((res: any) => {
        setServerList(res);
      })
      .catch(() => {});
  };

  const changeModalType = async (type?: string, path?: string, pasteTopic?: string) => {
    setOpen(true);
    if (pasteTopic) {
      //数据回填
      setSourcePath(path || '');
      const isPasteFolder = pasteTopic.endsWith('/');
      setAddModalType(isPasteFolder ? 'pasteFolder' : 'pasteFile');
      const getInfo = isPasteFolder ? getModelInfo : getInstanceInfo;
      const detail: any = await getInfo({ topic: pasteTopic });
      if (isPasteFolder) {
        const { description, name, modelId, fields } = detail || {};
        form.setFieldsValue({
          modelDescription: description,
          name,
          modelId: modelId || 'custom',
          fields,
        });
      } else {
        const {
          instanceDescription,
          name,
          modelId,
          fields,
          dataType,
          protocol,
          labelList,
          withDashboard,
          withFlow,
          withSave2db,
          expression,
          refers,
          dataPath,
        } = detail || {};

        const backfillForm: any = {
          instanceDescription,
          name,
          protocol: protocol || undefined,
          tags: labelList ? labelList.map((e: any) => ({ label: e.labelName, value: e.id })) : [],
          addDashBoard: withDashboard,
          save2db: withSave2db,
        };

        switch (dataType) {
          case 1:
          case 2:
            Object.assign(backfillForm, {
              dataType,
              attributeType: modelId ? 2 : 1,
              modelId: modelId,
              addFlow: withFlow,
              mainKey: fields.findIndex((item: any) => item.unique === true),
            });
            break;
          case 3:
            //实时计算
            Object.assign(backfillForm, {
              dataType,
              calculationType: 3,
              refers,
              expression: getExpression(refers, expression),
            });
            break;
          case 4: {
            //历史计算
            const {
              window,
              trigger = '',
              waterMark,
              deleteMark,
              fillHistory,
              ignoreUpdate,
              ignoreExpired,
              startTime,
              endTime,
            } = protocol || {};
            Object.assign(backfillForm, {
              dataType: 3,
              calculationType: 4,
              protocol: undefined,
              DataSource: dataPath,
              functions: parseArrayToObjects(fields.map((field: any) => field.index)),
              whereCondition: getExpression(refers, expression, true),
              streamOptions: { window },
              advancedOptions: !!trigger || !!waterMark || !!deleteMark || fillHistory || ignoreUpdate || ignoreExpired,
              _advancedOptions: {
                trigger: trigger.split(' ')[0],
                delayTime: trigger.split(' ')[1],
                waterMark,
                deleteMark,
                fillHistory,
                ignoreUpdate,
                ignoreExpired,
                startTime: startTime ? dayjs(startTime, 'YYYY-MM-DD') : undefined,
                endTime: endTime ? dayjs(endTime, 'YYYY-MM-DD') : undefined,
              },
            });
            if (dataPath) {
              searchTreeData({ type: 3, p: 1, sz: 99999 }).then((res: any) => {
                const whereFieldList =
                  res
                    ?.find((e: any) => e.topic === dataPath)
                    ?.fields?.map(({ name, type }: any) => {
                      return { label: name, value: name, type };
                    }) || [];
                form.setFieldsValue({ whereFieldList });
              });
            }

            break;
          }
          case 6:
            Object.assign(backfillForm, {
              dataType,
              frequency: protocol.frequency
                ? {
                    value: parseTime(protocol.frequency)[0],
                    unit: parseTime(protocol.frequency)[1],
                  }
                : {},
              referTopics: refers.map((item: any) => item.topic),
            });
            break;
          default:
            break;
        }
        console.log(backfillForm, 'backfillForm');
        form.setFieldsValue(backfillForm);
        setTimeout(() => {
          form.setFieldsValue({
            fields,
          });
        }, 500);
      }
    } else {
      setAddModalType(type || '');
      if (path) {
        const detail: any = await getModelInfo({ topic: path });
        const { fields, modelId }: any = detail || {};

        setSourcePath(path);
        switch (type) {
          case 'addFolder':
            form.setFieldsValue({
              topic: path,
              fields: fields,
              modelId: modelId || 'custom',
            });
            break;
          case 'addFile':
            form.setFieldsValue({
              topic: path,
              fields: fields || [{}],
              attributeType: modelId ? 2 : 1,
              modelId: modelId,
            });
            break;
          default:
            break;
        }
      } else {
        form.setFieldsValue(
          type?.includes('File')
            ? { fields: [{}], modelId: undefined }
            : {
                fields: undefined,
                modelId: 'custom',
              }
        );
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    getTypes()
      .then((res: any) => {
        setTypes(res || []);
      })
      .catch((err) => {
        console.log(err);
      });
    getAllTemplate({ pageNo: 0, pageSize: 9999 }).then((res: any) => {
      if (res && Array.isArray(res)) {
        setTemplateList([{ id: 'custom', path: formatMessage('common.custom') }].concat(res));
      }
    });
    setUuid(uuidv4().replace(/-/g, '').slice(0, 20));
  }, [open]);

  useEffect(() => {
    if (protocol) {
      getServers(protocol);
    } else {
      setServerList([]);
    }
  }, [protocol]);

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            types={types}
            addNamespaceForAi={addNamespaceForAi}
            setAddNamespaceForAi={setAddNamespaceForAi}
            uuid={uuid}
            isCreateFolder={isCreateFolder}
            sourcePath={sourcePath}
            templateList={templateList}
          />
        );
      case 2:
        return (
          <Step2
            types={types}
            setModalType={setModalType}
            serverList={serverList}
            getServers={getServers}
            setServerDetail={setServerDetail}
            addNamespaceForAi={addNamespaceForAi}
            setAddNamespaceForAi={setAddNamespaceForAi}
            customProtocolData={customProtocolData}
            setCustomProtocolData={setCustomProtocolData}
            serverConn={serverConn}
            setServerConn={setServerConn}
          />
        );
      case 3:
        return <Step3 targetFields={dataFieldsObj.dataFields || []} />;
      default:
        return null;
    }
  };
  const serverTitleMap: any = {
    addServer: formatMessage('common.newServer'),
    viewServer: formatMessage('uns.serverDetail'),
    addProtocol: formatMessage('uns.addProtocol'),
  };
  const titleMap: any = {
    addFolder: formatMessage('uns.newFolder'),
    addFile: formatMessage('uns.newFile'),
    pasteFolder: formatMessage('uns.pasteFolder'),
    pasteFile: formatMessage('uns.pasteFile'),
  };

  const Dom = (
    <Drawer
      rootClassName="optionDrawerWrap"
      title={modalType ? serverTitleMap[modalType] : titleMap[addModalType]}
      onClose={onClose}
      open={open}
      closable={false}
      style={{ backgroundColor: 'var(--supos-header-bg-color)', color: 'var(--supos-text-color)' }}
      extra={<Close size={20} onClick={onClose} style={{ cursor: 'pointer' }} />}
      maskClosable={false}
      destroyOnClose={false}
      width={680}
    >
      <div className="optionContent">
        {modalType ? (
          modalType === 'addProtocol' ? (
            <AddProtocol setModalType={setModalType} setCustomProtocolData={setCustomProtocolData} />
          ) : (
            <AddServer
              modalType={modalType}
              setModalType={setModalType}
              protocolName={protocol}
              getServers={getServers}
              serverDetail={serverDetail}
              restApiForm={form}
            />
          )
        ) : (
          <>
            <div className="formWrap">
              <Form
                name="namespaceForm"
                form={form}
                colon={false}
                style={{ color: 'var(--supos-text-color)', position: 'relative' }}
                initialValues={{
                  dataType: 1,
                  calculationType: 3,
                  refers: [{}],
                  save2db: false,
                }}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                labelAlign="left"
                labelWrap
              >
                {getStepContent()}
              </Form>
              <Divider style={{ borderColor: '#c6c6c6' }} />
            </div>
            <div className="optBtnWrap">
              {step > 1 && (
                <Button
                  color="default"
                  variant="filled"
                  size="small"
                  style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                  icon={<ChevronLeft />}
                  onClick={() => {
                    setStep(() => step - 1);
                  }}
                  disabled={loading}
                >
                  {formatMessage('uns.prev')}
                </Button>
              )}
              {(step === 1 && dataType === 6) ||
              (step === 2 && !['rest'].includes(protocol) && !advancedOptions) ||
              step === 3 ||
              isCreateFolder ? (
                <ComPopupGuide
                  key={isCreateFolder ? 'saveFolder' : 'saveFile'}
                  currentStep={addNamespaceForAi?.currentStep}
                  stepName={isCreateFolder ? 'saveFolder' : 'saveFile'}
                  steps={addNamespaceForAi?.steps}
                  placement="left"
                  onFinish={() => {
                    save?.();
                  }}
                >
                  <Button color="primary" variant="solid" size="small" onClick={save} loading={loading}>
                    {formatMessage('common.save')}
                  </Button>
                </ComPopupGuide>
              ) : (
                <ComPopupGuide
                  stepName={`next`}
                  steps={addNamespaceForAi?.steps}
                  currentStep={addNamespaceForAi?.currentStep}
                  onFinish={(_, nextStepName) => {
                    handleStep()
                      .then(() => {
                        setAddNamespaceForAi({
                          ...addNamespaceForAi,
                          currentStep: nextStepName,
                        });
                      })
                      .catch(() => {
                        setAddNamespaceForAi(null);
                      });
                  }}
                >
                  <Button
                    color="default"
                    variant="filled"
                    size="small"
                    icon={<ChevronRight />}
                    iconPosition="end"
                    onClick={handleStep}
                    style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                  >
                    {formatMessage('uns.next')}
                  </Button>
                </ComPopupGuide>
              )}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
  return {
    OptionModal: Dom,
    setOptionOpen: changeModalType,
    setModalClose: onClose,
    setMockNextStep: handleMockNextStep,
  };
};
export default useOptionModal;
