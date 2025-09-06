import { FC } from 'react';
import { PageProps } from '@/common-types.ts';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import { Flex } from 'antd';
import { Close, ListDropdown, View } from '@carbon/icons-react';
// import { useTranslate } from '@/hooks';
import ComLeft from '@/components/com-layout/ComLeft.tsx';
import { SortableTree } from './components/menu-tree';
import useMenuSetting from './components/menu-setting/useMenuSetting.tsx';

const Index: FC<PageProps> = ({ title }) => {
  // const formatMessage = useTranslate();
  const { onMenuModalOpen, MenuModal } = useMenuSetting();
  return (
    <ComLayout>
      {MenuModal}
      <ComContent
        hasBack={false}
        title={
          <Flex align="center" gap={8} style={{ lineHeight: 1 }}>
            <ListDropdown
              size={20}
              style={{ justifyContent: 'center', verticalAlign: 'middle' }}
              onClick={() => onMenuModalOpen()}
            />{' '}
            {title}
          </Flex>
        }
      >
        <ComLayout>
          <ComLeft resize defaultWidth={360} style={{ padding: 16 }}>
            <SortableTree
              indicator
              indentationWidth={32}
              rightExtra={() => {
                return (
                  <Flex gap={8}>
                    <View
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <Close
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </Flex>
                );
              }}
              allowDrop={({ drop, drag }) => {
                if (!drop) return true;
                if (drop.disabled) return false;
                if (drop.isLeaf) return false;
                if (!drag.isLeaf && !drop?.isLeaf) {
                  return false;
                }
                if (!drag.isLeaf && drop?.isLeaf) {
                  return false;
                }
                return true;
              }}
            />
          </ComLeft>
        </ComLayout>
      </ComContent>
    </ComLayout>
  );
};

export default Index;
