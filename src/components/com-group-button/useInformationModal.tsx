import { useRef, useState } from 'react';
import ComSelect from '../com-select';
import ProModal from '../pro-modal';
import { AuthButton } from '../auth';
import { App, Empty, Flex, Tag } from 'antd';
import { useTranslate, usePagination } from '@/hooks';
import ComPagination from '../com-pagination';
import styles from './InformationModal.module.scss';
import { confirmAlarm, getAlarmList } from '@/apis/inter-api/alarm.ts';
import { getAlertForSelect } from '@/apis/inter-api/uns.ts';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import InfoList from '../com-group-button/InfoList.tsx';
import Loading from '../loading';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { formatTimestamp } from '@/utils';
import { ComRadio } from '@/components';

const useInformationModal = ({ onCallBack }: any) => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [open, setOpen] = useState(false);
  const payload = useRef<any>();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const formatMessage = useTranslate();
  const [topicValue, setTopicValue] = useState();
  const {
    data: originData,
    pagination,
    setSearchParams,
    reload,
    loading,
  } = usePagination({
    initPageSize: 6,
    fetchApi: getAlarmList,
    simple: false,
    firstNotGetData: true,
  });

  const data = originData?.map?.((item: any) => {
    const { field, topic } = JSON.parse(item.refers || '[]')?.[0] || {};
    return {
      ...item,
      field,
      topic,
    };
  });

  const formulaObj: any = {
    '>': formatMessage('rule.greaterThanThreshold'),
    '<': formatMessage('rule.lessThanThreshold'),
    '<=': formatMessage('rule.lessEqualThreshold'),
    '>=': formatMessage('rule.greaterEqualThreshold'),
    '=': formatMessage('rule.equalThreshold'),
    '!=': formatMessage('rule.noEqualThreshold'),
  };

  const onOpen = (data: any) => {
    payload.current = data;
    setSearchParams({
      topic: data.topic,
      readStatus: undefined,
    });
    setTopicValue(data.topic);
    setOpen(true);
    navigate('', { replace: true, state: {} });
  };

  const onClose = () => {
    setOpen(false);
    setStatus(undefined);
  };

  const Dom = (
    <ProModal
      open={open}
      onCancel={onClose}
      size="xs"
      title={formatMessage('alert.alert')}
      className={classNames(styles['information-modal'])}
    >
      <Loading spinning={loading}>
        <Flex vertical style={{ height: '100%', overflow: 'hidden' }}>
          <Flex align="center" gap={10} wrap justify={'flex-start'} style={{ padding: '10px 1rem' }}>
            <ComSelect
              isRequest={open}
              variant="filled"
              style={{ width: 150 }}
              value={topicValue}
              allowClear
              onChange={(v) => {
                setTopicValue(v);
                setSearchParams({
                  readStatus: status ? status !== 'pending' : undefined,
                  topic: v,
                });
              }}
              api={() => getAlertForSelect({ page: 1, pageSize: 10000, type: 5 })}
            />
            <Flex flex={1}>
              <ComRadio
                options={[
                  { label: formatMessage('information.pending'), value: 'pending' },
                  { label: formatMessage('information.processed'), value: 'processed' },
                ]}
                value={status}
                onClick={(e) => {
                  const val = e.target.value;
                  setStatus((prevState) => {
                    if (prevState === val) {
                      setSearchParams({
                        readStatus: undefined,
                        topic: topicValue,
                      });
                      return undefined;
                    }
                    setSearchParams({
                      readStatus: false,
                      topic: topicValue,
                    });
                    return val;
                  });
                }}
              />
            </Flex>

            <AuthButton
              auth={ButtonPermission['alert.confirm']}
              size="small"
              type="primary"
              disabled={!data.some((item: any) => item.canHandler) || data.every((item: any) => item.readStatus)}
              onClick={() => {
                modal.confirm({
                  zIndex: 9999,
                  title: formatMessage('common.confirmOpt'),
                  onOk: () => {
                    confirmAlarm({
                      confirmType: 2,
                      topic: topicValue,
                    }).then(() => {
                      onCallBack?.();
                      reload();
                      message.success(formatMessage('common.optsuccess'));
                    });
                  },
                  afterClose: () => {},
                  okText: formatMessage('appSpace.confirm'),
                  cancelButtonProps: {
                    // style: { color: '#000' },
                  },
                });
              }}
            >
              {formatMessage('information.confirmAll')}
            </AuthButton>
          </Flex>
          {data?.length > 0 ? (
            <>
              <InfoList
                items={data?.map((item: any) => ({
                  key: item.id,
                  label: (
                    <span>
                      {!item.readStatus && (
                        <Tag
                          color="#DA1E28"
                          style={{
                            padding: 2,
                            lineHeight: 1,
                            borderRadius: 10,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {formatMessage('information.new')}
                        </Tag>
                      )}

                      {item.ruleName}
                    </span>
                  ),
                  extra: <span>{formatMessage('alert.alert')}</span>,
                  children: (
                    <div>
                      <div
                        style={{ opacity: item.readStatus ? 0.8 : 1 }}
                      >{`【${item.topic}】.【${item.field}】${formatMessage('rule.in')} ${formatTimestamp(item.createAt)} ${item.isAlarm ? formulaObj?.[item?.condition || '>'] + '【' + item.limitValue + '】' : formatMessage('rule.alertCancel')}，${formatMessage('rule.currentValue')}【${item.currentValue}】${item.isAlarm ? '，' + formatMessage('rule.deal') : ''}`}</div>
                      <Flex justify="flex-end" style={{ marginTop: 4 }}>
                        {!item.readStatus || (item.canHandler && !item.readStatus) ? (
                          <AuthButton
                            auth={ButtonPermission['alert.confirm']}
                            size="small"
                            type="primary"
                            disabled={!item.canHandler}
                            onClick={() => {
                              modal.confirm({
                                zIndex: 9999,
                                title: formatMessage('common.confirmOpt'),
                                onOk: () => {
                                  confirmAlarm({
                                    confirmType: 1,
                                    topic: item.topic,
                                    ids: [item.id],
                                  }).then(() => {
                                    onCallBack?.();
                                    reload();
                                    message.success(formatMessage('common.optsuccess'));
                                  });
                                },
                                afterClose: () => {},
                                onCancel: () => {},
                                okText: formatMessage('appSpace.confirm'),
                                cancelButtonProps: {
                                  // style: { color: '#000' },
                                },
                              });
                            }}
                          >
                            {formatMessage('information.confirm')}
                          </AuthButton>
                        ) : (
                          <AuthButton size="small" disabled style={{ cursor: 'inherit' }}>
                            {formatMessage('information.processed')}
                          </AuthButton>
                        )}
                      </Flex>
                    </div>
                  ),
                }))}
              />
            </>
          ) : (
            <Empty style={{ padding: '20px 1rem' }} />
          )}
          <div style={{ padding: '0 1rem' }}>
            <ComPagination simple {...pagination} />
          </div>
        </Flex>
      </Loading>
    </ProModal>
  );
  return {
    ModalDom: Dom,
    onOpen,
  };
};

export default useInformationModal;
