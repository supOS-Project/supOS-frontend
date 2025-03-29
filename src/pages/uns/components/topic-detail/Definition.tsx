import { FC } from 'react';
import { useTranslate } from '@/hooks';
import Icon from '@ant-design/icons';
import { MainKey } from '@/components';

const Definition: FC<any> = ({ instanceInfo }) => {
  const formatMessage = useTranslate();

  return (
    <table className="customTable" border={1} cellSpacing="1">
      <thead>
        <tr>
          <td style={{ width: '20%' }}>{formatMessage('uns.key')}</td>
          <td style={{ width: '20%' }}>{formatMessage('uns.type')}</td>
          <td style={{ width: '20%' }}>{formatMessage('uns.displayName')}</td>
          <td style={{ width: '20%' }}>{formatMessage('uns.remark')}</td>
          <td>{formatMessage('uns.index')}</td>
        </tr>
      </thead>
      <tbody>
        {(instanceInfo?.fields || []).map((e: any) => (
          <tr key={e.name}>
            <td>
              {e.unique && (
                <Icon
                  style={{ color: 'var(--supos-theme-color)', marginRight: '5px' }}
                  title={formatMessage('uns.mainKey')}
                  component={MainKey}
                />
              )}
              {e.name}
            </td>
            <td>{e.type}</td>
            <td>{e.displayName}</td>
            <td>{e.remark}</td>
            <td>{e.index}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default Definition;
