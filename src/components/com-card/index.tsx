import { FC, CSSProperties, ReactNode } from 'react';

import { Flex, Image, Spin, Typography } from 'antd';
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
}) => {
  return (
    <div>
      <Spin spinning={loading || false}>
        <Flex className="custom-card" style={style} gap={20} align="flex-start" justify="flex-start">
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
          <Flex vertical style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            <Flex justify="space-between" style={{ overflow: 'hidden' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {title && (
                  <div className="card-title" title={typeof title === 'string' ? title : ''}>
                    {title}
                  </div>
                )}
              </div>
              <div>{operation && <div>{operation}</div>}</div>
            </Flex>
            {secondaryTitle && (
              <div className="card-secondary-title" title={typeof secondaryTitle === 'string' ? secondaryTitle : ''}>
                {secondaryTitle}
              </div>
            )}
            {tag && <div>{tag}</div>}
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
          </Flex>
        </Flex>
      </Spin>
    </div>
  );
};

export default ComCard;
