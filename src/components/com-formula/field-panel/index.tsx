import { CSSProperties, FC } from 'react';
import { Flex, Tag } from 'antd';

const FieldPanel: FC<{
  onClick?: (item: any) => void;
  fieldList?: { label: string; value: string }[];
  style?: CSSProperties;
}> = ({ onClick, fieldList = [], style }) => {
  return (
    <Flex wrap gap={'10px 0'} style={style}>
      {fieldList?.map((item) => (
        <Tag
          key={item.value}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => {
            onClick?.(item);
          }}
        >
          {item.label}
        </Tag>
      ))}
    </Flex>
  );
};

export default FieldPanel;
