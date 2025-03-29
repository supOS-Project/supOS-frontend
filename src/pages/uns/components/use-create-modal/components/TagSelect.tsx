import { useState, FC, useEffect } from 'react';
import { Select } from 'antd';
import { getAllLabel } from '@/apis/inter-api/uns';

const TagSelect: FC<any> = ({ value, onChange, ...rest }) => {
  const [options, setOptions] = useState<any>([]);

  const searchAllTags = async () => {
    const res = await getAllLabel();
    if (res && Array.isArray(res)) {
      setOptions(res);
    }
  };
  useEffect(() => {
    searchAllTags();
  }, []);

  return (
    <Select
      {...rest}
      showSearch
      filterOption
      options={options}
      value={value}
      onChange={onChange}
      mode="tags"
      allowClear
      fieldNames={{
        label: 'labelName',
        value: 'id',
      }}
      labelInValue
    />
  );
};

export default TagSelect;
