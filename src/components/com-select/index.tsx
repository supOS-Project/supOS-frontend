import { FC, useEffect, useMemo, useState } from 'react';
import { Select, SelectProps, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { useTranslate } from '@/hooks';

interface ComSelectProps extends SelectProps {
  options?: any[];
  api?: any;
  debounceTimeout?: number;
  isRequest?: boolean;
}

const ComSelect: FC<ComSelectProps> = ({ options, api, debounceTimeout = 500, isRequest, ...restProps }) => {
  const formatMessage = useTranslate();
  const [apiOptions, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: any) => {
      setOptions([]);
      setFetching(true);
      searchData(value);
    };
    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout]);

  const searchData = (key?: any) => {
    api(key)
      .then((res: any) => {
        setOptions(res);
        setFetching(false);
      })
      .finally(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    if (api && isRequest) {
      searchData();
    }
  }, [isRequest]);

  return api ? (
    <Select
      placeholder={formatMessage('common.select')}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...restProps}
      onSearch={api ? debounceFetcher : restProps?.onSearch}
      filterOption={!!api}
      options={api ? apiOptions : options}
    />
  ) : (
    <Select placeholder={formatMessage('common.select')} {...restProps} options={options} />
  );
};

export default ComSelect;
