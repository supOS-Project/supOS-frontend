import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';
import './index.scss';
import { CSSProperties, FC, ReactNode } from 'react';
import { useTranslate } from '@/hooks';
import ComPagination from '../com-pagination';

export type OperationOptionsProps = {
  title?: string;
  width?: number;
  render(record: any, index: number): ReactNode;
};

interface ColumnType {
  dataIndex: string;
  title: ReactNode;
  render?: (text: any, record: any, index: number) => ReactNode;
}
export interface ComTableProps {
  scroll?: { y: string };
  style?: CSSProperties;
  columns?: ColumnType[];
  data?: any[];
  rowKey?: string;
  pagination?: any;
  operationOptions?: OperationOptionsProps;
}

const ComTable: FC<ComTableProps> = ({
  scroll,
  style,
  data = [],
  rowKey = 'id',
  columns = [],
  pagination,
  operationOptions,
}) => {
  const formatMessage = useTranslate();
  if (operationOptions) {
    columns.push({
      title: operationOptions?.title ?? formatMessage('common.operation'),
      dataIndex: 'operation',
      render: (_: string, record: any, index: number) => {
        return operationOptions.render?.(record, index);
      },
    });
  }
  return (
    <div className="com-table" style={{ ...style, '--com-table-body-height': scroll?.y ? scroll?.y : 'auto' }}>
      <Table size="sm" useZebraStyles={false} aria-label="sample table">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableHeader id={col.dataIndex} key={col.dataIndex}>
                {col.title}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row[rowKey]}>
              {columns.map((col) => (
                <TableCell key={col.dataIndex}>
                  {col?.render ? col?.render?.(row[col.dataIndex], row, index) : row[col.dataIndex]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ComPagination {...pagination} />
    </div>
  );
};

export default ComTable;
