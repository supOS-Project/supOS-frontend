import { FC } from 'react';
import { useTranslate } from '@/hooks';

const Restapi: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  const syncRateMap: any = {
    ms: formatMessage('uns.millisecond'),
    s: formatMessage('uns.second'),
    m: formatMessage('uns.minute'),
    h: formatMessage('uns.hour'),
  };

  const methodMap: any = {
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    delete: 'DELETE',
  };
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>Rest Api</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.serverName')}</div>
        <div>{protocol.serverName}</div>
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
        <div className="detailKey">{formatMessage('uns.method')}</div>
        <div>{methodMap[protocol.method]}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">HTTPS</div>
        <div>{typeof protocol.https === 'boolean' ? formatMessage(protocol.https ? 'uns.true' : 'uns.false') : ''}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.path')}</div>
        <div>{protocol.path}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.headers')}</div>
        <div>{JSON.stringify(protocol.headersObj)}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.params')}</div>
        <div>{JSON.stringify(protocol.paramsObj)}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.syncRate')}</div>
        <div>{`${protocol?.syncRate?.value} ${syncRateMap[protocol?.syncRate?.unit]}`}</div>
      </div>
    </>
  );
};
export default Restapi;
