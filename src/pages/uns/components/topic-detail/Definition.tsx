import { FC } from 'react';
import { useTranslate } from '@/hooks';
import Icon from '@ant-design/icons';
import ProTable from '@/components/pro-table';
import MainKey from '@/components/svg-components/MainKey';

interface DefinitionProps {
  instanceInfo: { [key: string]: any };
}

const Definition: FC<DefinitionProps> = ({ instanceInfo }) => {
  const formatMessage = useTranslate();

  return (
    <ProTable
      bordered
      columns={[
        {
          title: formatMessage('uns.key'),
          dataIndex: 'name',
          width: '20%',
          render: (text, record) => (
            <div>
              {record.unique && (
                <Icon
                  style={{
                    color: 'var(--supos-theme-color)',
                    marginRight: '5px',
                    verticalAlign: 'middle',
                  }}
                  title={formatMessage('uns.mainKey')}
                  component={MainKey}
                />
              )}
              {text}
            </div>
          ),
        },
        {
          title: formatMessage('uns.type'),
          dataIndex: 'type',
          width: '20%',
          render: (text) => <span style={{ color: 'var(--supos-theme-color)' }}>{text}</span>,
        },
        {
          title: formatMessage('common.length'),
          dataIndex: 'maxLen',
          width: '20%',
          render: (text) => <span style={{ color: 'var(--supos-theme-color)' }}>{text}</span>,
        },
        {
          title: formatMessage('uns.displayName'),
          dataIndex: 'displayName',
          width: '20%',
          render: (text) => <span style={{ color: 'var(--supos-theme-color)' }}>{text}</span>,
        },
        {
          title: formatMessage('uns.remark'),
          dataIndex: 'remark',
          width: '20%',
          render: (text) => <span style={{ color: 'var(--supos-theme-color)' }}>{text}</span>,
        },
      ]}
      dataSource={instanceInfo?.fields || []}
      rowKey="name"
      pagination={false}
      size="middle"
      hiddenEmpty
      rowHoverable={false}
    />
  );
};
export default Definition;
