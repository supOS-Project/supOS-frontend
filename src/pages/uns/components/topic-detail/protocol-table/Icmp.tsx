import { FC } from 'react';
import { useTranslate } from '@/hooks';
import { Tag } from 'antd';

const Icmp: FC<any> = ({ protocol, fileStatusInfo }) => {
  const formatMessage = useTranslate();
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>ICMP</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">IP</div>
        <div>{protocol?.server?.host}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.status')}</div>
        <div>
          {fileStatusInfo?.status ? (
            <Tag color="green">{formatMessage('common.online')}</Tag>
          ) : (
            <Tag color="red">{formatMessage('common.offline')}</Tag>
          )}
        </div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.pingInterval')}</div>
        <div>{protocol?.interval ? protocol?.interval + formatMessage('uns.second') : ''}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.timeout')}</div>
        <div>{protocol?.timeout ? protocol?.timeout + formatMessage('uns.second') : ''}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.retryCount')}</div>
        <div>{protocol?.retry}</div>
      </div>
    </>
  );
};
export default Icmp;
