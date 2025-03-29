import { useMemo, useState, FC } from 'react';
import { Spin, Select, Divider, Button } from 'antd';
import debounce from 'lodash/debounce';
import { searchTreeData } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

const DebounceSelect: FC<any> = ({
  value,
  onChange,
  debounceTimeout = 500,
  index = 0,
  type = 3,
  normal,
  selectAll,
  ...rest
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const formatMessage = useTranslate();

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: any) => {
      setOptions([]);
      setFetching(true);
      searchData(value);
    };
    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout]);

  const searchData = (key?: any) => {
    const params: any = { type, p: 1, sz: 100, normal };
    if (key) params.k = key;
    searchTreeData(params)
      .then((res: any) => {
        const newRes = (res || []).map((e: any) => {
          return type < 3
            ? {
                value: e,
              }
            : {
                ...e,
                value: e.topic,
              };
        });
        setOptions(newRes);
        setFetching(false);
      })
      .catch((err) => {
        setFetching(false);
        console.log(err);
      });
  };

  const _onChange = (e: any) => {
    onChange(e, options, index);
  };

  return (
    <Select
      {...rest}
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : formatMessage('uns.noData')}
      options={options}
      value={value}
      onChange={_onChange}
      onFocus={() => searchData()}
      allowClear
      dropdownRender={(menu) => (
        <>
          {menu}
          {options.length > 0 && (selectAll || options.length > 99) && (
            <>
              <Divider style={{ margin: '4px 0', borderColor: '#c6c6c6' }} />
              {selectAll && (
                <div style={{ textAlign: 'center' }}>
                  <Button
                    color="default"
                    variant="filled"
                    onClick={() => {
                      selectAll(options.map((option: any) => option.value));
                    }}
                    size="small"
                    style={{ backgroundColor: 'var(--supos-uns-button-color)' }}
                  >
                    {formatMessage('uns.select100Items')}
                  </Button>
                </div>
              )}
              {options.length > 99 && (
                <div style={{ textAlign: 'center' }}>{formatMessage('uns.forMoreInformationPleaseSearch')}</div>
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default DebounceSelect;
