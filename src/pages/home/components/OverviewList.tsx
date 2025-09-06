import { CSSProperties, FC } from 'react';
import { Divider, Flex, Spin, Typography } from 'antd';
import { ChevronRight } from '@carbon/icons-react';
import { ResourceProps } from '@/stores/types';
import { useMenuNavigate } from '@/hooks';
import styles from '../index.module.scss';
import IconImage from '@/components/icon-image';
import { useThemeStore } from '@/stores/theme-store.ts';
import { ExampleProps } from '@/pages/home';
const { Paragraph } = Typography;

interface MenuListProps {
  list: ExampleProps[];
  type?: string;
  customOptRender?: (params: any) => JSX.Element;
  loadingViews?: string[];
  style?: CSSProperties;
}

const Item = ({ item, theme, iconName, type, customOptRender }: any) => {
  return (
    <Flex style={{ height: '100%' }} align="flex-start" justify="flex-start">
      <div
        style={{
          borderRadius: 3,
          backgroundColor: 'var(--supos-image-card-color)',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.iconComp || <IconImage theme={theme} iconName={iconName} width={28} height={28} />}
      </div>
      <div className={`item-content ${type === 'example' ? styles.exampleItemContent : ''}`}>
        <div className={`label ${type === 'example' ? styles.exampleLabel : ''}`} title={item.showName}>
          <div className={styles.name}>{item.showName}</div>
          {type === 'example' && customOptRender && customOptRender(item)}
        </div>
        <div className="description" title={item.showDescription || ''}>
          {item.showDescription || ''}
        </div>
      </div>
      {type !== 'example' && (
        <div style={{ marginTop: 2 }}>
          <ChevronRight />
        </div>
      )}
    </Flex>
  );
};
const OverviewList: FC<MenuListProps> = ({ list, type, customOptRender, loadingViews, style }) => {
  const handleNavigate = useMenuNavigate();
  const primaryColor = useThemeStore((state) => state.primaryColor);

  const handleClickItem = (item: ResourceProps) => {
    if (type === 'example') {
      return;
    }
    handleNavigate(item);
  };

  return (
    <div style={{ padding: '0 36px', ...style }}>
      {list.map((item, index) => {
        return (
          // 新手导航 id
          <div key={item.id} id={`home_section_step${index + 1}`}>
            <Paragraph style={{ margin: '30px 0 20px' }}>
              <Flex align="center" gap={4}>
                {item.iconComp || (
                  <IconImage
                    theme={primaryColor}
                    iconName={item.icon}
                    width={24}
                    height={24}
                    style={{ paddingRight: 4, verticalAlign: 'middle' }}
                  />
                )}
                <span style={{ fontSize: 20 }}>{item.showName}</span>
              </Flex>
            </Paragraph>
            <Flex wrap gap={18}>
              {(item?.children?.length ? item?.children : [item])?.map?.((c) => {
                // 新手导航 id
                let unsMenuId;
                if (c?.url === '/uns') {
                  unsMenuId = 'home_route_uns';
                }
                return (
                  <div id={unsMenuId} key={c.id} className={styles['menu-item']} onClick={() => handleClickItem(c)}>
                    <Spin spinning={(loadingViews || []).includes(c.id as string)}>
                      <Item
                        item={c}
                        theme={primaryColor}
                        iconName={c.icon}
                        type={type}
                        customOptRender={customOptRender}
                      />
                    </Spin>
                  </div>
                );
              })}
            </Flex>
            <Divider />
          </div>
        );
      })}
    </div>
  );
};

export default OverviewList;
