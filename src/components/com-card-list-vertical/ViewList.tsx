import { FC } from 'react';
import './index.scss';

const ViewList: FC<any> = ({ viewOptions, item }) => {
  return (
    <div className="view-list-flex-start">
      <div className="view-list-item item-left">
        {viewOptions?.map((option: any) => (
          <div className="label" style={{ flexShrink: 0 }}>
            {option.label}
          </div>
        ))}
      </div>
      <div className="view-list-item item-right">
        {viewOptions?.map((option: any) => (
          <div className="text" title={item[option.valueKey]}>
            {option?.render ? option?.render?.(item[option.valueKey], item, option.valueKey) : item[option.valueKey]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewList;
