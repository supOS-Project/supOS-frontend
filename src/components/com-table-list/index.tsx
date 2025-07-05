import { CSSProperties, FC } from 'react';
import { ConfigProvider, Pagination } from 'antd';
import type { TableColumnsType } from 'antd';
import classNames from 'classnames';
import ProTable from '../pro-table';
import './index.scss';

interface ComTableListProps {
  columns: TableColumnsType;
  pagination: any;
  className?: string;
  style?: CSSProperties;
  [prop: string]: any;
}

const ComTableList: FC<ComTableListProps> = ({ columns, pagination, className, style, ...restProps }) => {
  return (
    <div className={classNames('com-table-list', className)} style={style}>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: 'var(--supos-charttop-bg-color)',
              rowHoverBg: 'var(--supos-charttop-bg-color)',
            },
          },
        }}
      >
        <ProTable
          size="small"
          resizeable
          className="table-list-ProTable"
          scroll={{ y: 'calc(100% - 40px)', x: 'max-content' }}
          columns={columns}
          pagination={false}
          {...restProps}
        />
      </ConfigProvider>
      <Pagination
        size="small"
        className="custom-pagination"
        align="end"
        style={{ margin: '16px 0 0' }}
        total={pagination?.total}
        showSizeChanger
        showQuickJumper
        pageSizeOptions={pagination?.pageSizes}
        onChange={pagination.onChange}
        onShowSizeChange={(current, size) => {
          pagination.onChange({ page: current, pageSize: size });
        }}
        pageSize={pagination?.pageSize || 20}
        current={pagination?.page}
      />
    </div>
  );
};

export default ComTableList;
