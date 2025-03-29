import { TextInput } from '@carbon/react';
import styles from '@/pages/app-management/components/AppList.module.scss';
import { useState } from 'react';
import { createApp } from '@/apis/inter-api/apps';
import { message } from 'antd';
import { useTranslate } from '@/hooks';
import { ProModal } from '@/components';

const useAddModal = ({ successCallBack }: any) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const formatMessage = useTranslate();

  const addApps = () => {
    if (name) {
      createApp({ name })
        .then(() => {
          setName('');
          setOpen(false);
          successCallBack?.();
        })
        .catch((e) => {
          console.log(e);
          setName('');
        });
    } else {
      message.warning('Type your app name');
    }
  };
  const Dom = (
    <ProModal
      className={styles['modal']}
      size="xs"
      open={open}
      maskClosable={false}
      onCancel={() => setOpen(false)}
      title={formatMessage('appSpace.name')}
    >
      <TextInput
        labelText=""
        value={name}
        onChange={(e) => setName(e.target.value)}
        id="name"
        placeholder={formatMessage('appSpace.yourAppName')}
      />
      <div className="add-button" onClick={addApps}>
        {formatMessage('appSpace.add')}
      </div>
    </ProModal>
  );
  return {
    ModalDom: Dom,
    setModalOpen: setOpen,
  };
};

export default useAddModal;
