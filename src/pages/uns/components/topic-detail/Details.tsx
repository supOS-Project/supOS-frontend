import { FC } from 'react';
import { Modbus, Opcua, Opcda, Restapi, Mqtt, Custom, History, Aggregation, Icmp } from './protocol-table';
import { formatTimestamp } from '@/utils';
import { useTranslate } from '@/hooks';
import { Tag } from 'antd';

const Details: FC<any> = ({ instanceInfo, updateTime, websocketData, fileStatusInfo }) => {
  const formatMessage = useTranslate();
  const dataTypeMap: any = {
    1: formatMessage('uns.timeSeries'),
    2: formatMessage('uns.relational'),
    3: formatMessage('uns.realtimeCalculation'),
    4: formatMessage('uns.historicalCalculation'),
    6: formatMessage('uns.aggregation'),
  };
  const renderProtocolTable = (protocol: any) => {
    if (instanceInfo.dataType === 4) return <History protocol={protocol} dataPath={instanceInfo.dataPath} />;
    if (instanceInfo.dataType === 6) return <Aggregation protocol={protocol} refers={instanceInfo.refers || []} />;
    if (!protocol?.protocol) return null;
    switch (protocol.protocol) {
      case 'modbus':
        return <Modbus protocol={protocol} />;
      case 'opcua':
        return <Opcua protocol={protocol} />;
      case 'opcda':
        return <Opcda protocol={protocol} />;
      case 'rest':
        return <Restapi protocol={protocol} />;
      case 'mqtt':
        return <Mqtt protocol={protocol} />;
      case 'icmp':
        return (
          <Icmp
            protocol={protocol}
            fileStatusInfo={fileStatusInfo}
            payload={JSON.parse(websocketData?.payload || null)}
          />
        );
      default:
        return <Custom protocol={protocol} />;
    }
  };
  return (
    <>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.alias')}</div>
        <div>{instanceInfo.alias}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.description')}</div>
        <div>{instanceInfo.instanceDescription}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">
          {formatMessage(
            instanceInfo?.protocol?.referenceDataSource ? 'uns.referenceDataSource' : 'uns.referenceTemplate'
          )}
        </div>
        <div>{instanceInfo?.protocol?.referenceDataSource || instanceInfo.modelName}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.databaseType')}</div>
        <div>{dataTypeMap[instanceInfo.dataType]}</div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.label')}</div>
        <div>
          {instanceInfo.labelList &&
            instanceInfo.labelList.map((tag: any, index: number) => {
              return <Tag key={index}>{tag.labelName}</Tag>;
            })}
        </div>
      </div>
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.persistence')}</div>
        <div>{formatMessage(instanceInfo.withSave2db ? 'uns.true' : 'uns.false')}</div>
      </div>
      {instanceInfo.protocol && renderProtocolTable(instanceInfo.protocol)}
      {instanceInfo.expression && (
        <div className="detailItem">
          <div className="detailKey">{formatMessage('uns.expression')}</div>
          <div>{instanceInfo.expression.replace(/\$(.*?)#/g, '$1')}</div>
        </div>
      )}
      <div className="detailItem">
        <div className="detailKey">{formatMessage('common.creationTime')}</div>
        <div>{formatTimestamp(instanceInfo.createTime)}</div>
      </div>
      {![3, 4].includes(instanceInfo.dataType) && (
        <div className="detailItem">
          <div className="detailKey">{formatMessage('common.latestUpdate')}</div>
          {updateTime && <div>{formatTimestamp(updateTime)}</div>}
        </div>
      )}
      <div className="detailItem">
        <div className="detailKey">{formatMessage('uns.namespace')}</div>
        <div>{instanceInfo.topic}</div>
      </div>
    </>
  );
};
export default Details;
