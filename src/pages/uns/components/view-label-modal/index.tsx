import { useState } from 'react';
import { ProModal } from '@/components';
import { Button, Flex } from 'antd';
import { Launch } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import './index.scss';

interface LabelItem {
  id: string | number;
  labelName: string;
}

const Module = ({ toTargetNode }: any) => {
  const formatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const [labelList, setLabelList] = useState<LabelItem[]>([]);

  const setModalOpen = (labelList: LabelItem[]) => {
    setLabelList(labelList);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
  };

  const Dom = (
    <ProModal className="viewLabelModalWrap" open={open} onCancel={close} title={formatMessage('uns.label')} size="xxs">
      <Flex gap={10}>
        {labelList.map((label: LabelItem) => (
          <Button
            key={label.id}
            color="default"
            variant="filled"
            icon={<Launch size={12} style={{ color: '#8d8d8d' }} />}
            iconPosition="end"
            size="small"
            style={{
              border: '1px solid #CBD5E1',
              color: 'var(--supos-text-color)',
              backgroundColor: 'var(--supos-uns-button-color)',
            }}
            onClick={() => {
              toTargetNode('label', { type: 9, path: label.id });
              close();
            }}
          >
            {label.labelName}
          </Button>
        ))}
      </Flex>
      <Button
        className="viewLabelConfirm"
        color="primary"
        variant="solid"
        onClick={close}
        block
        style={{ marginTop: '20px' }}
        size="large"
      >
        {formatMessage('common.confirm')}
      </Button>
    </ProModal>
  );
  return {
    ViewLabelModal: Dom,
    setLabelOpen: setModalOpen,
  };
};
export default Module;
