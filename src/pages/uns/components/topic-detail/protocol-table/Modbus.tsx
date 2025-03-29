import { FC } from 'react';
import { useTranslate } from '@/hooks';

const Modbus: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  const syncRateMap: any = {
    ms: formatMessage('uns.millisecond'),
    s: formatMessage('uns.second'),
    m: formatMessage('uns.minute'),
    h: formatMessage('uns.hour'),
  };
  const FCMap: any = {
    Coil: formatMessage('uns.fc1'),
    Input: formatMessage('uns.fc2'),
    HoldingRegister: formatMessage('uns.fc3'),
    InputRegister: formatMessage('uns.fc4'),
  };

  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>Modbus</div>
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
        <div className="detailKey">{formatMessage('uns.unitID')}</div>
        <div>{protocol.unitId}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">FC</div>
        <div>{FCMap[protocol.fc]}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.address')}</div>
        <div>{protocol.address}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.quantity')}</div>
        <div>{protocol.quantity}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.pollRate')}</div>
        <div>{`${protocol?.pollRate?.value} ${syncRateMap[protocol?.pollRate?.unit]}`}</div>
      </div>
    </>
  );
};
export default Modbus;
