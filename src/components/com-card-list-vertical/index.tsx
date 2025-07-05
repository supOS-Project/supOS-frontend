import { Edit, FlowConnection } from '@carbon/icons-react';
import { CSSProperties, FC, ReactNode } from 'react';
import { Empty, Flex, Tag } from 'antd';
import ViewList from './ViewList';
import OperationButtons, { OperationButtonsProps } from '../operation-buttons';
import { useTranslate } from '@/hooks';
import { AuthWrapper } from '../auth';
import './index.scss';

interface ComCardListVerticalProps {
  list: { name?: string; type?: string; description?: string; runStatus?: string; icon?: ReactNode }[];
  onEditHandle?: (item?: any) => void;
  editAuth?: string | string[];
  runStatusOptions?: { value: string; bgType: string; text?: string }[];
  operationOptions?: OperationButtonsProps['options'];
  viewOptions?: { valueKey: string; label: string; render?: (text?: any, record?: any, key?: string) => ReactNode }[];
  cardIcon?: ReactNode;
  style?: CSSProperties;
  cardStyle?: CSSProperties;
}

const ComCardListVertical: FC<ComCardListVerticalProps> = ({
  /**
   * @param name 标题
   * @param type 模板
   * @param description 描述
   * @param runStatus 运行状态
   * */
  list,
  cardIcon,
  style,
  cardStyle,
  // 编辑操作
  onEditHandle,
  editAuth,
  // 状态配置
  runStatusOptions = [
    {
      value: 'Run',
      bgType: 'green',
    },
    {
      value: 'Stop',
      bgType: 'red',
    },
    {
      value: 'Ready',
      bgType: 'blue',
    },
  ],
  operationOptions,
  viewOptions: defaultViewOptions,
}) => {
  const formatMessage = useTranslate();

  // view配置
  const viewOptions = defaultViewOptions
    ? defaultViewOptions
    : [
        {
          label: formatMessage('collectionFlow.flowTemplate'),
          valueKey: 'type',
        },
        {
          label: formatMessage('uns.description'),
          valueKey: 'description',
        },
      ];
  const titleStatehandle = (item: any) => {
    return runStatusOptions?.find((f: any) => f.value === item.status)?.text || item.status;
  };
  return (
    <div className="com-card-list-vertical" style={style}>
      {list?.length > 0 ? (
        list.map((item: any) => (
          <div className="com-item-card com-card" key={item.id} style={cardStyle}>
            <div className="com-card-left">
              <div className="com-card-icon">{cardIcon ? cardIcon : <FlowConnection size="40" />}</div>
              <div className="com-card-info">
                <div className="com-card-header">
                  <Flex align="center" gap={2} style={{ overflow: 'hidden' }}>
                    {item.icon}
                    <div className="name" title={item.name}>
                      {item.name}
                    </div>
                  </Flex>
                  {item.status && (
                    <div>
                      <Tag
                        style={{ borderRadius: 15, lineHeight: '16px', margin: 0 }}
                        bordered={false}
                        color={(runStatusOptions?.find((f: any) => f.value === item.status)?.bgType || 'red') as any}
                      >
                        {titleStatehandle(item)}
                      </Tag>
                    </div>
                  )}
                  <AuthWrapper auth={editAuth}>
                    <div className="edit-icon">
                      <Edit size={18} onClick={() => onEditHandle?.(item)} />
                    </div>
                  </AuthWrapper>
                </div>
                <div className="com-card-content">
                  <ViewList viewOptions={viewOptions} item={item} />
                </div>
              </div>
            </div>
            {operationOptions && (
              <div className="com-card-right">
                <OperationButtons options={operationOptions} record={item} />
              </div>
            )}
          </div>
        ))
      ) : (
        <Flex justify="center" style={{ width: '100%' }}>
          <Empty />
        </Flex>
      )}
    </div>
  );
};

export default ComCardListVertical;
