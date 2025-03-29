import { FC } from 'react';
import { Divider, Flex, Spin, Typography } from 'antd';
import { ChevronRight } from '@carbon/icons-react';
import { RoutesProps } from '@/stores/types';
import { useMenuNavigate } from '@/hooks';
import { observer } from 'mobx-react-lite';
import styles from '../index.module.scss';
import { useThemeContext } from '@/contexts/theme-context.ts';
import { IconImage } from '@/components';
const { Paragraph } = Typography;

interface MenuListProps {
  list: RoutesProps[];
  type?: string;
  customOptRender?: (params: any) => JSX.Element;
  loadingViews?: string[];
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
        <div className={`label ${type === 'example' ? styles.exampleLabel : ''}`} title={item.name}>
          <div className={styles.name}>{item.name}</div>
          {type === 'example' && customOptRender && customOptRender(item)}
        </div>
        <div className="description" title={item.description || ''}>
          {item.description || ''}
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
const OverviewList: FC<MenuListProps> = ({ list, type, customOptRender, loadingViews }) => {
  const handleNavigate = useMenuNavigate();
  const themeStore = useThemeContext();

  const handleClickItem = (item: RoutesProps) => {
    if (type === 'example') {
      return;
    }
    handleNavigate(item);
  };

  return (
    <div style={{ padding: '0 36px' }}>
      {list.map((item, index) => {
        return (
          // 新手导航 id
          <div key={item.key} id={`home_section_step${index + 1}`}>
            <Paragraph style={{ margin: '30px 0 20px' }}>
              <Flex align="center" gap={4}>
                {item.iconComp || (
                  <IconImage
                    theme={themeStore.theme}
                    iconName={item.iconUrl}
                    width={24}
                    height={24}
                    style={{ paddingRight: 4, verticalAlign: 'middle' }}
                  />
                )}
                <span style={{ fontSize: 20 }}>{item.name}</span>
              </Flex>
            </Paragraph>
            <Flex wrap gap={18}>
              {item?.children?.map?.((c) => {
                return (
                  <div
                    // 新手导航 id
                    // id={`home_route_${c?.key?.replace(/\s/g, '')}`}
                    key={c.key}
                    className={styles['menu-item']}
                    onClick={() => handleClickItem(c)}
                  >
                    <Spin spinning={(loadingViews || []).includes(c.key as string)}>
                      <Item
                        item={c}
                        theme={themeStore.theme}
                        iconName={c.iconUrl}
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

export default observer(OverviewList);
