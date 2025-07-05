import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Dropdown, Form, message, Space, Breadcrumb } from 'antd';
import { copyFlow, deployFlow, saveFlow } from '@/apis/inter-api/event-flow';
import { ChevronLeft, OverflowMenuVertical } from '@carbon/icons-react';
import { useLocalStorage, useTranslate } from '@/hooks';
import { useUpdateEffect } from 'ahooks';
import { PageProps } from '@/common-types';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import './index.scss';
import ComText from '@/components/com-text';
import { AuthButton } from '@/components/auth';
import ComDrawer from '@/components/com-drawer';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import OperationForm from '@/components/operation-form';
import { hasPermission } from '@/utils/auth';
import { validInputPattern } from '@/utils/pattern';
import { getSearchParamsObj, getSearchParamsString, getDevProxyBaseUrl } from '@/utils/url-util';

const EventFlowPreview: FC<PageProps> = ({ location }) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [show, setShow] = useState(false);
  const state = getSearchParamsObj(location?.search) || {};
  const navigate = useNavigate();
  const iframeUrl = `/eventflow/home/?sup_event_flow_id=${state.id}&sup_origin_event_flow_id=${state.flowId}`;
  const breadcrumbList = [
    {
      name: state.name,
    },
  ];
  const formatMessage = useTranslate();
  const nodeRedLang = useLocalStorage('editor-language');
  const flowIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  // const [buttonDisabled, setDisabled] = useState(state?.status === 'RUNNING');
  const loadRef = useRef(false);
  // iframe的key
  const [key, setKey] = useState(Date.now());
  useUpdateEffect(() => {
    if (!loadRef.current) return;
    if (nodeRedLang) {
      setKey(Date.now());
    }
  }, [nodeRedLang]);
  // 将 flows 数据保存到后端
  const saveFlowsToBackend = async (data: any) => {
    try {
      const { flows, type } = data;
      // 需要过滤掉type为tab的数据
      const filterFlows = flows?.filter((item: any) => item.type !== 'tab');
      const api = type === 'save' ? saveFlow : deployFlow;
      setLoading(true);
      api({
        flows: filterFlows,
        id: state?.id,
      })
        .then((flowId: any) => {
          if (type === 'deploy') {
            if (!state.flowId && flowId) {
              navigate(`/EvenFlow/Editor?${getSearchParamsString({ ...state, flowId: flowId })}`, {
                replace: true,
              });
            }
            setKey(Date.now());
            // setDisabled(true);
          } else {
            setLoading(false);
          }
          message.success(type === 'deploy' ? formatMessage('appGui.deployOk') : formatMessage('appGui.saveSuccess'));
        })
        .catch(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error('Error saving flows:', error);
      setLoading(false);
    }
  };

  // 监听 iframe 加载
  useUpdateEffect(() => {
    const iframe = flowIframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [key]); // 依赖 iframeKey 的变化（重新加载时触发）

  useEffect(() => {
    setLoading(true);
    // 监听来自 Node-RED 的 flows 数据
    const handleMessage = (event: any) => {
      if (event.data.type === 'currentEventFlows') {
        saveFlowsToBackend(event.data.data);
      } else if (event.data.type === 'eventFlowsChange') {
        // setDisabled(!event.data?.data?.contentsChanged);
      }
    };

    const loadFn = () => {
      loadRef.current = true;
      setLoading(false);
    };
    if (flowIframeRef.current) {
      flowIframeRef.current.addEventListener('load', loadFn);
    }
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (flowIframeRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        flowIframeRef.current && flowIframeRef.current.removeEventListener('load', loadFn);
      }
    };
  }, [state?.id, state?.flowId]);

  const setPostMessage = (type: string) => {
    if (flowIframeRef.current) {
      setLoading(true);
      flowIframeRef.current.contentWindow!.postMessage({ data: type, type: 'requestEventFlows' }, '*');
    }
  };

  // 点击按钮请求 flows 数据
  const onSaveFlows = () => {
    setPostMessage('save');
  };

  const onDeployFlows = () => {
    setPostMessage('deploy');
  };

  const onCopyFlows = () => {
    setShow(true);
  };

  const onOpenMenuHandle = (id: string) => {
    if (flowIframeRef.current) {
      flowIframeRef.current.contentWindow!.postMessage({ data: { id }, type: 'openEventMenu' }, '*');
    }
  };

  const onClose = () => {
    setShow(false);
    form.resetFields();
  };

  const formItemOptions = [
    {
      label: formatMessage('eventFlow.copyFlow'),
    },
    {
      label: formatMessage('common.name'),
      name: 'flowName',
      rules: [
        { required: true, message: '' },
        { pattern: validInputPattern, message: '' },
      ],
    },
    {
      label: formatMessage('collectionFlow.flowTemplate'),
      name: 'template',
      type: 'Select',
      properties: {
        options: [
          {
            label: 'node-red',
            value: 'node-red',
          },
        ],
        disabled: true,
      },
      initialValue: 'node-red',
      rules: [{ required: true, message: '' }],
    },
    {
      label: formatMessage('uns.description'),
      name: 'description',
    },
    {
      label: 'id',
      name: 'id',
      hidden: true,
    },
    {
      type: 'divider',
    },
  ];

  const onSave = async () => {
    const values = await form.validateFields();
    setApiLoading(true);
    copyFlow({
      ...values,
      sourceId: state.id,
    })
      .then((data) => {
        setShow(false);
        modal.confirm({
          title: formatMessage('common.copyConfirm'),
          onOk: () => {
            form.resetFields();
            navigate(
              `/EvenFlow/Editor?${getSearchParamsString({ id: data, name: values.flowName, status: 'DRAFT' })}`,
              {
                replace: true,
              }
            );
          },
          onCancel: () => {
            form.resetFields();
          },
          cancelButtonProps: {
            // style: { color: '#000' },
          },
          okText: formatMessage('common.confirm'),
        });
      })
      .finally(() => {
        setApiLoading(false);
      });
  };

  const items: any = [
    {
      key: 'menu-item-import',
      auth: ButtonPermission['eventFlow.import'],
      label: formatMessage('common.import'),
    },
    {
      key: 'menu-item-export',
      auth: ButtonPermission['eventFlow.export'],
      label: formatMessage('uns.export'),
    },
    {
      type: 'divider',
    },
    {
      key: 'menu-item-search',
      auth: ButtonPermission['eventFlow.process'],
      label: formatMessage('flowEditor.process'),
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'config-nodes',
    //   label: <span onClick={() => onOpenMenuHandle('menu-item-config-nodes')}>修改节点配置</span>,
    // },
    // {
    //   type: 'divider',
    // },
    {
      key: 'menu-item-edit-palette',
      auth: ButtonPermission['eventFlow.nodeManagement'],
      label: formatMessage('flowEditor.nodeManagement'),
    },
    // {
    //   type: 'divider',
    // },
    // {
    //   key: 'menu-item-user-settings',
    //   label: <span>设置</span>,
    // },
  ]
    ?.filter((i) => i.type === 'divider' || i.label)
    ?.filter((f) => {
      return !f.auth || hasPermission(f.auth);
    });
  return (
    <ComLayout loading={loading}>
      <ComContent
        mustHasBack={false}
        style={{ overflow: 'hidden' }}
        hasPadding
        border={false}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button
                variant="outlined"
                color="default"
                icon={<ChevronLeft size={16} />}
                style={{ paddingLeft: '5.5px', gap: '3px' }}
                onClick={() => {
                  navigate(-1);
                }}
              >
                {formatMessage('common.back')}
              </Button>
              <Breadcrumb
                separator=">"
                items={breadcrumbList?.map((item: any, idx: number) => {
                  if (idx + 1 === breadcrumbList?.length) {
                    return {
                      title: item.name,
                    };
                  }
                  return {
                    title: <ComText>{item.name}</ComText>,
                    onClick: () => {
                      if (!item.path) return;
                      navigate(item.path);
                    },
                  };
                })}
              />
            </div>
            <Space>
              <AuthButton
                auth={ButtonPermission['eventFlow.copy']}
                loading={loading}
                color="primary"
                variant="outlined"
                onClick={onCopyFlows}
              >
                {formatMessage('common.copy')}
              </AuthButton>
              <AuthButton
                auth={ButtonPermission['eventFlow.save']}
                loading={loading}
                type="primary"
                onClick={onSaveFlows}
              >
                {formatMessage('common.save')}
              </AuthButton>
              <AuthButton
                auth={ButtonPermission['eventFlow.deploy']}
                loading={loading}
                type="primary"
                onClick={onDeployFlows}
                // disabled={buttonDisabled}
              >
                {formatMessage('appGui.deploy')}
              </AuthButton>
              <Dropdown
                menu={{
                  onClick: (e) => {
                    onOpenMenuHandle(e.key);
                  },
                  items: items,
                }}
                placement="bottomRight"
              >
                <div className="flow-dropdown-more">
                  <OverflowMenuVertical />
                </div>
              </Dropdown>
            </Space>
          </div>
        }
      >
        <iframe
          key={key}
          ref={flowIframeRef}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title={'Node-RED'}
          src={`${getDevProxyBaseUrl()}${iframeUrl}`}
        />
      </ComContent>
      <ComDrawer title=" " open={show} onClose={onClose}>
        <OperationForm
          loading={apiLoading}
          form={form}
          onCancel={onClose}
          onSave={onSave}
          formItemOptions={formItemOptions}
        />
      </ComDrawer>
    </ComLayout>
  );
};

export default EventFlowPreview;
