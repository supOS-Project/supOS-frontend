import { FC } from 'react';
import { useTranslate } from '@/hooks';
import { simpleFormat } from '@/utils';

const Custom: FC<any> = ({ protocol }) => {
  const formatMessage = useTranslate();
  const server: any = {};
  if (protocol.server && typeof protocol.server === 'object') {
    Object.keys(protocol.server).forEach((key: any) => {
      server[`Server.${key}`] = protocol.server[key];
    });
  }
  Object.assign(protocol, server);
  delete protocol.server;

  const capitalizeFirstLetter = (str: any) => {
    if (!str) return str;

    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.protocols')}</div>
        <div>{protocol.protocol}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.serverName')}</div>
        <div>{protocol.serverName}</div>
      </div>
      {Object.keys(protocol).map((key1: any) => {
        if (['protocol', 'protocolName', 'serverName'].includes(key1)) return null;
        return (
          <div className="detailItem" key={key1}>
            <div className="detailKey">{capitalizeFirstLetter(key1)}</div>
            <div>{simpleFormat(protocol[key1])}</div>
          </div>
        );
      })}
    </>
  );
};
export default Custom;
