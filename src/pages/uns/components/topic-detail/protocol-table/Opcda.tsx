import { FC } from 'react';
import { useTranslate } from '@/hooks';

const Opcda: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>OPCDA</div>
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
        <div className="detailKey">{formatMessage('uns.domain')}</div>
        <div>{protocol?.server?.domain}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.pollRate')}</div>
        <div>{`${protocol?.pollRate?.value}${protocol?.pollRate?.unit}`}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.account')}</div>
        <div>{protocol?.server?.account}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.password')}</div>
        <div>{protocol?.server?.password?.replace(/./g, '*')}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.clsid')}</div>
        <div>{protocol?.server?.clsid}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.timeout')}</div>
        <div>{`${protocol?.server?.timeout}${formatMessage('uns.millisecond')}`}</div>
      </div>
    </>
  );
};
export default Opcda;
