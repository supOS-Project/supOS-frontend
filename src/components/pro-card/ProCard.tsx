import { Checkbox, Divider, Flex, Spin, Image, Typography, Dropdown, Button } from 'antd';
import { FC, useState } from 'react';
import { ProCardProps } from '@/components/pro-card/type.ts';
import cx from 'classnames';
import { ChevronRight } from '@carbon/icons-react';
import { EllipsisOutlined } from '@ant-design/icons';
import { AuthButton } from '@/components/auth';
import defaultUrl from '@/assets/home-icons/default.svg';
import InlineLoading from '@/components/inline-loading';
import { hasPermission } from '@/utils/auth.ts';
import './index.scss';

const { Paragraph } = Typography;

const ProCard: FC<ProCardProps> = ({
  loading,
  styles,
  classNames,
  value,
  onChange,
  statusHeader,
  header,
  onClick,
  description,
  secondaryDescription,
  allowHover = true,
  actions: _actions,
  item,
}) => {
  const [checked, setChecked] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);
  const cardClassName = cx('pro-card', classNames?.card, checked && 'pro-card-checked', allowHover && 'pro-card-hover');
  const { allowCheck, statusInfo, statusTag } = statusHeader || {};
  const { customIcon, defaultIconUrl = defaultUrl, iconSrc, title, titleDescription } = header || {};
  const actions = _actions
    ? typeof _actions === 'function'
      ? _actions(item)
          ?.filter((f) => f?.key)
          .filter((item: any) => {
            return item && (!item.auth || hasPermission(item.auth));
          })
      : _actions
          ?.filter((f) => f?.key)
          .filter((item: any) => {
            return item && (!item.auth || hasPermission(item.auth));
          })
    : _actions;
  const handleClick = async (e: any, onClick: any) => {
    if (!onClick) return;

    try {
      setClickLoading(true);
      const result = onClick(e);

      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setClickLoading(false);
    }
  };
  return (
    <div style={styles?.root} className={classNames?.root}>
      <Spin spinning={loading || clickLoading || false}>
        <Flex
          vertical
          className={cardClassName}
          onClick={() => onClick?.(item)}
          style={{ cursor: onClick ? 'pointer' : 'inherit', ...styles?.card }}
        >
          {/* statusHeader */}
          {statusHeader ? (
            <Flex
              className={cx('pro-card-status-header', classNames?.statusHeader)}
              style={{ ...styles?.statusHeader }}
              justify="space-between"
              align="center"
              gap={4}
            >
              {allowCheck ? (
                <Checkbox
                  value={value}
                  className="card-title"
                  onChange={(e) => {
                    setChecked(e.target.checked);
                    onChange?.(e);
                  }}
                />
              ) : (
                <span></span>
              )}
              <Flex
                align="center"
                style={{ flex: 1, overflow: 'hidden', ...styles?.statusInfo }}
                className={cx(styles?.statusInfo)}
                justify="flex-end"
              >
                {statusInfo && (
                  <Flex
                    style={{ flex: 1, overflow: 'hidden' }}
                    justify="flex-end"
                    align="center"
                    gap={8}
                    title={`${statusInfo.title}: ${statusInfo.label}`}
                  >
                    <div
                      style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo?.color, flexShrink: 0 }}
                    />
                    <Paragraph
                      ellipsis={{
                        rows: 1,
                      }}
                      style={{ margin: 0, wordBreak: 'break-all', color: 'var(--supos-table-first-color)' }}
                    >
                      {statusInfo.label}
                    </Paragraph>
                  </Flex>
                )}
                {statusInfo && statusTag && (
                  <Divider
                    type="vertical"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    }}
                  />
                )}
                {statusTag && (
                  <Flex align="center" style={styles?.statusTag} className={classNames?.statusTag}>
                    {statusTag}
                  </Flex>
                )}
              </Flex>
            </Flex>
          ) : null}
          {/* Header */}
          <Flex
            className={cx('pro-card-header', classNames?.header)}
            style={{ ...styles?.header }}
            justify="space-between"
            gap={16}
          >
            <Flex
              style={{
                borderRadius: 3,
                backgroundColor: 'var(--supos-image-card-color)',
                padding: 6,
              }}
            >
              {customIcon ? (
                customIcon
              ) : (
                <Image preview={false} src={`${iconSrc ?? ''}`} width={28} height={28} fallback={defaultIconUrl} />
              )}
            </Flex>
            <Flex
              justify={titleDescription ? 'space-between' : 'center'}
              style={{ flex: 1, overflow: 'hidden' }}
              vertical
            >
              <Flex align="center" justify="space-between" title={typeof title === 'string' ? title : ''}>
                <div className={cx('header-title')}>{title}</div>
                {onClick && <ChevronRight style={{ flexShrink: 0 }} />}
              </Flex>
              {titleDescription && (
                <div title={typeof titleDescription === 'string' ? titleDescription : ''} className="title-description">
                  {titleDescription}
                </div>
              )}
            </Flex>
          </Flex>
          {/* description */}
          {description && (
            <div
              className="pro-card-description"
              title={typeof description === 'string' ? description : description?.content}
              style={{
                height: typeof description === 'string' ? 60 : description?.rows ? (60 / 3) * description?.rows : 60,
              }}
            >
              <Paragraph
                ellipsis={{
                  rows: typeof description === 'string' ? 3 : description?.rows || 3,
                }}
                style={{ margin: 0, wordBreak: 'break-all', color: 'var(--supos-table-first-color)', fontSize: 12 }}
              >
                {typeof description === 'string' ? description : description?.content}
              </Paragraph>
            </div>
          )}
          {/* 二级描述 */}
          {secondaryDescription && (
            <div
              className="pro-card-secondary-description"
              title={typeof secondaryDescription === 'string' ? secondaryDescription : undefined}
            >
              {secondaryDescription}
            </div>
          )}
          {actions && (
            <Divider
              style={{
                margin: '16px 0',
                backgroundColor: 'var(--supos-t-dividr-color)',
              }}
            />
          )}
          {actions && (
            <Flex align="center" justify="space-between">
              <Flex gap={8} align="center" style={{ flex: 1, overflow: 'hidden' }}>
                {Array.isArray(actions) &&
                  actions.slice(0, 2).map(({ label, key, title, icon, button, onClick, status, disabled }) =>
                    key === 'loading' ? (
                      <InlineLoading key={key} status={status || 'active'} description={label} />
                    ) : (
                      <AuthButton
                        {...button}
                        style={{
                          ...button?.style,
                          maxWidth: 'calc((100% - 16px) / 2)',
                        }}
                        icon={icon}
                        size="small"
                        key={key}
                        onClick={(e) => handleClick(e, onClick)}
                        title={title ? title : typeof label === 'string' ? label : ''}
                        disabled={disabled}
                      >
                        {label}
                      </AuthButton>
                    )
                  )}
              </Flex>
              {Array.isArray(actions) && actions.length > 2 && (
                <Dropdown
                  menu={{
                    items: actions.slice(2).map(({ key, label, icon, title, onClick, disabled }) => ({
                      key,
                      label,
                      icon,
                      title: title ? title : typeof label === 'string' ? label : '',
                      onClick: (e) => handleClick(e, onClick),
                      disabled,
                    })),
                  }}
                >
                  <Button type="text" icon={<EllipsisOutlined />} size="small" />
                </Dropdown>
              )}
            </Flex>
          )}
        </Flex>
      </Spin>
    </div>
  );
};

export default ProCard;
