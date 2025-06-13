import { AddLarge, Delete } from '@carbon/icons-react';
import { CSSProperties, FC, ReactNode, useState } from 'react';
import { App, Flex, Tag } from 'antd';
import ViewList from '../com-card-list/ViewList';
import FooterOperation, { FooterOperationProps } from '../com-card-list/FooterOperation';
import { useTranslate } from '@/hooks';
import { AuthWrapper } from '../auth';
import './index.scss';
import { ThemeType, useThemeStore } from '@/stores/theme-store.ts';

interface ComCardListProps {
  list: { name?: string; type?: string; description?: string; runStatus?: string; icon?: ReactNode }[];
  onAddHandle?: (item?: any) => void;
  onDeleteHandle?: (item?: any) => void;
  imgSrc?: any;
  hoverImgSrc?: any;
  addAuth?: string | string[];
  deleteAuth?: string | string[];
  runStatusOptions?: { value: string; bgType: string; text?: string }[];
  operationOptions?: FooterOperationProps['options'];
  viewOptions?: { valueKey: string; label: string; render?: (text?: any, record?: any, key?: string) => ReactNode }[];
  style?: CSSProperties;
  cardStyle?: CSSProperties;
}

const ComCardList: FC<ComCardListProps> = ({
  /**
   * @param name 标题
   * @param type 模板
   * @param description 描述
   * @param runStatus 运行状态
   * */
  list,
  style,
  cardStyle,
  // 新增操作
  onAddHandle,
  // 删除操作
  onDeleteHandle,
  // 背景图
  imgSrc,
  // hover进去的背景图
  hoverImgSrc,
  addAuth,
  deleteAuth,
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
  const [hover, setHover] = useState('');
  const formatMessage = useTranslate();
  const { modal } = App.useApp();
  const theme = useThemeStore((state) => state.theme);

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
    <div className="com-card-list" style={style}>
      <AuthWrapper auth={addAuth}>
        <div className="com-add com-card" style={cardStyle} onClick={onAddHandle}>
          <AddLarge size={106} />
        </div>
      </AuthWrapper>
      {list.map((item: any) => (
        <div
          className="com-item-card com-card"
          onMouseEnter={() => setHover(item.id)}
          onMouseLeave={() => setHover('')}
          key={item.id}
          style={{
            '--crl-border-color':
              hover === item.id && !(theme === ThemeType.Dark) ? 'var(--supos-card-border-color)' : '#C6C6C6',
            ...cardStyle,
          }}
        >
          <div className="com-card-header">
            <div className="header-content">
              <Flex align="center" gap={2} style={{ overflow: 'hidden' }}>
                {item.icon}
                <div className="name" title={item.name}>
                  {item.name}
                </div>
              </Flex>
              {item.status && (
                <div>
                  <Tag
                    style={{ borderRadius: 15 }}
                    bordered={false}
                    color={(runStatusOptions?.find((f: any) => f.value === item.status)?.bgType || 'red') as any}
                  >
                    {titleStatehandle(item)}
                  </Tag>
                </div>
              )}
            </div>
            <AuthWrapper auth={deleteAuth}>
              <div className="delete-icon">
                <Delete
                  size={19}
                  onClick={() =>
                    modal.confirm({
                      title: formatMessage('common.deleteConfirm'),
                      onOk: () => onDeleteHandle?.(item),
                      okText: formatMessage('common.confirm'),
                      cancelButtonProps: {
                        // style: { color: '#000' },
                      },
                    })
                  }
                />
              </div>
            </AuthWrapper>
          </div>
          <div className="com-card-content">
            {imgSrc && <img src={item.id === hover ? hoverImgSrc : imgSrc} />}
            <ViewList viewOptions={viewOptions} item={item} />
          </div>
          {operationOptions && (
            <div className="com-card-footer">
              <FooterOperation options={operationOptions} record={item} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ComCardList;
