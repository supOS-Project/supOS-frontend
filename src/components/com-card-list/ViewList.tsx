import { FC } from 'react';
import './index.scss';

const ViewList: FC<any> = ({ viewOptions, item }) => {
  return (
    <div className="view-list">
      {viewOptions?.map((option: any, index: number) => (
        <div key={option.valueKey} className="view-list-item">
          <div
            style={{
              flexShrink: 0,
              maxWidth: '50%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            title={option.label}
          >
            {option.label}
          </div>
          <div
            className="text"
            title={item[option.valueKey]}
            style={{
              '--supos-line-clamp': viewOptions?.length - 1 < index ? 2 : 1,
            }}
          >
            {option?.render ? option?.render?.(item[option.valueKey], item, option.valueKey) : item[option.valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewList;
