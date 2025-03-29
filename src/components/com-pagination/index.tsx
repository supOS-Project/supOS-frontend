import { Pagination } from '@carbon/react';
import { useTranslate } from '@/hooks';
import { ComponentProps, FC } from 'react';
import classNames from 'classnames';
import './index.scss';

type PaginationProps = ComponentProps<typeof Pagination>;
export interface ComPaginationProps extends PaginationProps {
  simple?: boolean;
}

const ComPagination: FC<ComPaginationProps> = ({ simple, className, ...props }) => {
  const formatMessage = useTranslate();

  return (
    <Pagination
      backwardText={formatMessage('common.previousPage')}
      forwardText={formatMessage('common.nextPage')}
      itemsPerPageText=" "
      size="sm"
      itemRangeText={(min, max, total) => {
        if (simple) {
          return ``;
        }
        return `${min}–${max} ${formatMessage('common.of')} ${total} ${formatMessage('common.items')}`;
      }}
      pageRangeText={(current, total) => {
        if (simple) {
          return `${formatMessage('common.page')} ${current} , ${formatMessage('common.of')} ${total}`;
        }
        return `${formatMessage('common.of')} ${total} ${formatMessage('common.pages')}`;
      }}
      className={classNames(className, { 'com-pagination-simple': !!simple })}
      {...props}
    />
  );
};

export default ComPagination;
