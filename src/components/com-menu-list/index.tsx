import { FC } from 'react';
import { Flex, Image } from 'antd';
import { ChevronRight } from '@carbon/icons-react';
import defaultIconUrl from '@/assets/home-icons/default.svg';
import { ContainerItemProps } from '@/stores/types';
import { Original_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans';
import './index.scss';

interface MenuListProps {
  list: ContainerItemProps[];
  clickable?: boolean;
  onItemClick?: (item: any) => void;
  showDescription?: boolean;
  height?: number | string;
}

const Item = ({ item, src, clickable, showDescription }: any) => {
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
        <Image
          preview={false}
          src={`${STORAGE_PATH}${Original_TARGET_PATH}/${src}`}
          width={28}
          height={28}
          fallback={defaultIconUrl}
        />
      </div>
      <div className="item-content">
        <div className="label" title={item.name}>
          {item.name}
        </div>
        <div className="version">Version {item.version}</div>
        {showDescription && (
          <div className="description" title={item.description || ''}>
            {item.description || ''}
          </div>
        )}
      </div>
      {clickable && (
        <div style={{ marginTop: 2 }}>
          <ChevronRight />
        </div>
      )}
    </Flex>
  );
};

const MenuList: FC<MenuListProps> = ({ list, clickable = false, onItemClick, showDescription = true, height }) => {
  return (
    <Flex wrap gap={18} style={{ padding: '20px' }}>
      {list.map((item, index) => (
        <div
          key={index}
          className="menuItem"
          onClick={() => onItemClick?.(item)}
          style={{ cursor: clickable ? 'pointer' : 'default', height: height ?? 156 }}
        >
          <Item item={item} src={item?.envMap?.service_logo} clickable={clickable} showDescription={showDescription} />
        </div>
      ))}
    </Flex>
  );
};

export default MenuList;
