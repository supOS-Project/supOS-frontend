import { ComponentProps, FC } from 'react';
import { PaginationNav } from '@carbon/react';
import './index.scss';

type PaginationNavProps = ComponentProps<typeof PaginationNav>;
export interface ComPaginationNavProps extends PaginationNavProps {
  pageSizes?: number[];
  pageSize?: number;
}

const ComPaginationNav: FC<ComPaginationNavProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pageSizes, pageSize, ...restPagination } = props;
  return (
    <div className="com-pagination-nav">
      <PaginationNav
        size="sm"
        itemsShown={10}
        {...restPagination}
        style={{
          '--cds-text-on-color-disabled': 'var(--supos-text-color)',
          '--cds-text-primary': 'var(--supos-text-color)',
        }}
      />
    </div>
  );
};

export default ComPaginationNav;
