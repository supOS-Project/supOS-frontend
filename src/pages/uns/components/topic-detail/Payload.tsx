import { FC } from 'react';
import { useTranslate } from '@/hooks';
import { simpleFormat, formatTimestamp } from '@/utils';
import { Alert } from 'antd';

const Payload: FC<any> = ({ websocketData }) => {
  const { data, dt = {}, msg } = websocketData || {};
  const formatMessage = useTranslate();
  if (msg) {
    return <Alert message={<span style={{ color: '#161616' }}>{msg}</span>} type="error" showIcon />;
  }
  return (
    <table className="customTable" border={1} cellSpacing="1">
      <thead>
        <tr>
          <td style={{ width: '30%' }}>{formatMessage('uns.keyName')}</td>
          <td style={{ width: '30%' }}>{formatMessage('uns.value')}</td>
          <td>{formatMessage('common.latestUpdate')}</td>
        </tr>
      </thead>
      {data && (
        <tbody>
          {Object.keys(data || {}).map((key) => (
            <tr key={key}>
              <td className="payloadFirstTd">{key}</td>
              <td>{simpleFormat(data[key])}</td>
              <td>{formatTimestamp(dt[key])}</td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
};
export default Payload;
