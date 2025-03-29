import { FC } from 'react';
import { useTranslate } from '@/hooks';

const Opcua: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  const syncRateMap: any = {
    ms: formatMessage('uns.millisecond'),
    s: formatMessage('uns.second'),
    m: formatMessage('uns.minute'),
    h: formatMessage('uns.hour'),
  };
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>OPCUA</div>
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
        <div className="detailKey">{formatMessage('uns.location')}</div>
        <div>{protocol?.server?.location}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.pollRate')}</div>
        <div>{`${protocol?.pollRate?.value} ${syncRateMap[protocol?.pollRate?.unit]}`}</div>
      </div>
    </>
  );
};
export default Opcua;
