import { FC } from 'react';
import { useTranslate } from '@/hooks';

const Mqtt: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>MQTT</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.serverName')}</div>
        <div>{protocol?.serverName}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.host')}</div>
        <div>{protocol?.server?.host}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.port')}</div>
        <div>{protocol?.server?.port}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('appGui.username')}</div>
        <div>{protocol?.server?.username}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('appGui.password')}</div>
        <div>{protocol?.server?.password}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.inputTopic')}</div>
        <div>{protocol?.inputTopic}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.inputName')}</div>
        <div>{protocol?.inputName}</div>
      </div>
    </>
  );
};
export default Mqtt;
