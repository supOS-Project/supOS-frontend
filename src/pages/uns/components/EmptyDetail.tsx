import { Empty } from 'antd';
import { Subdirectory } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';

const EmptyDetail = () => {
  const formatMessage = useTranslate();

  return (
    <Empty
      styles={{
        root: {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
        },
      }}
      image={<Subdirectory size={140} />}
      description={formatMessage('common.selectTree')}
    ></Empty>
  );
};

export default EmptyDetail;
