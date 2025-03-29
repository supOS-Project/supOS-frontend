import { FC } from 'react';
import './index.scss';

const ViewList: FC<any> = ({ viewOptions, item }) => {
  return (
    <div className="view-list">
      {viewOptions?.map((option: any) => (
        <div key={option.valueKey} className="view-list-item">
          <div style={{ flexShrink: 0 }}>{option.label}</div>
          <div className="text" title={item[option.valueKey]}>
            {option?.render ? option?.render?.(item[option.valueKey], item, option.valueKey) : item[option.valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewList;
