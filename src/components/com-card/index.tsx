import { FC, CSSProperties, ReactNode } from 'react';
import { Checkbox, Divider, Flex, Image, Spin, Typography } from 'antd';
import defaultIconUrl from '@/assets/home-icons/default.svg';
const { Paragraph } = Typography;
import './index.scss';

export interface ComCardProps {
  style?: CSSProperties;
  title?: ReactNode; // 标题
  secondaryTitle?: ReactNode; // 次级标题
  tag?: ReactNode; // 标签
  description?: ReactNode; // 描述
  operation?: ReactNode; // 操作
  imageSrc?: string;
  loading?: boolean;
  customImage?: ReactNode;
  // 卡片状态颜色
  statusInfo?: {
    label: string;
    color: string;
    title: string;
  };
  // 更新时间
  updateTime?: string;
  // checkbox选中问题
  checkValue?: string;
}
const ComCard: FC<ComCardProps> = ({
  style,
  title,
  secondaryTitle,
  tag,
  description,
  operation,
  imageSrc,
  loading,
  customImage,
  statusInfo,
  updateTime,
  checkValue,
}) => {
  return (
    <div>
      <Spin spinning={loading || false}>
        <Flex className={'custom-card'} style={style} gap={20} align="flex-start" justify="flex-start">
          <Flex vertical style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            {/*多选+状态*/}
            <Flex justify="space-between" style={{ paddingBottom: 10 }}>
              {checkValue ? <Checkbox value={checkValue} className="card-title" /> : <div></div>}
              <Flex align="center">
                {statusInfo && (
                  <Flex justify="flex-start" align="center" gap={8} title={`${statusInfo.title}: ${statusInfo.label}`}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo?.color }} />
                    {statusInfo.label}
                  </Flex>
                )}
                {statusInfo && (
                  <Divider
                    type="vertical"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    }}
                  />
                )}
                {tag && <div>{tag}</div>}
              </Flex>
            </Flex>
            {/*logo + 名称 + 时间*/}
            <Flex justify="space-between" style={{ overflow: 'hidden', marginBottom: 8 }} gap={16}>
              <Flex
                style={{
                  borderRadius: 3,
                  backgroundColor: 'var(--supos-image-card-color)',
                  padding: 6,
                }}
              >
                {customImage ? (
                  customImage
                ) : (
                  <Image preview={false} src={`${imageSrc}`} width={28} height={28} fallback={defaultIconUrl} />
                )}
              </Flex>
              <Flex justify="space-between" style={{ flex: 1, overflow: 'hidden' }} vertical>
                <div className="card-title" title={typeof title === 'string' ? title : ''}>
                  {title}
                </div>
                {updateTime && (
                  <div title={updateTime} className="card-time">
                    {updateTime}
                  </div>
                )}
              </Flex>
            </Flex>
            {/*描述*/}
            {description && (
              <div className="card-description" title={typeof description === 'string' ? description : ''}>
                <Paragraph
                  ellipsis={{
                    rows: 3,
                  }}
                  style={{ margin: 0, wordBreak: 'break-all' }}
                >
                  {description}
                </Paragraph>
              </div>
            )}
            {/* 二级标题 */}
            {secondaryTitle && (
              <div className="card-secondary-title" title={typeof secondaryTitle === 'string' ? secondaryTitle : ''}>
                {secondaryTitle}
              </div>
            )}
            <Divider
              style={{
                margin: '16px 0',
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
              }}
            />
            {/* 操作 */}
            <div>{operation && <div>{operation}</div>}</div>
          </Flex>
        </Flex>
      </Spin>
    </div>
  );
};

export default ComCard;
