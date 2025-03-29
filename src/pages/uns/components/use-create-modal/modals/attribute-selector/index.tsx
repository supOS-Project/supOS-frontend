import { FC, useState, useImperativeHandle, useEffect, useCallback, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { debounce, filter, includes, isEmpty, map } from 'lodash';
import { Button, Table, Typography } from 'antd';
import { Search } from '@carbon/react';
import { ProModal, ComPagination } from '@/components';
import { useTranslate } from '@/hooks';
import { getProtocolTags } from '@/apis/inter-api/protocol';
import './index.scss';
import classNames from 'classnames';

const { Text, Paragraph } = Typography;

// todo test
// const getMockData = (v1: any) => {
//   console.log('request-data', v1);
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const list: any[] = [];
//       for (let i = 0; i < 10000; i++) {
//         list.push({
//           name: `Attribute ${i + 1}`,
//           dataType: 'long',
//         });
//       }
//       resolve(list);
//     }, 500);
//   });
// };

interface ProtocolConfig {
  protocolName: string;
  serverConfig: any;
}

interface IProps {
  modalHeading: string;
  attrListRef: any;
  protocolConfig: ProtocolConfig;
  types?: any[];
  onSubmit: (selectedVal: any) => void;
}

const AttributeSelector: FC<IProps> = (props) => {
  const { attrListRef, modalHeading, protocolConfig, types, onSubmit } = props;
  const [closeClass, setCloseClass] = useState(false);
  const defaultPagination = useMemo(
    () => ({
      totalItems: 0,
      page: 1,
      pageSize: 10,
      pageSizes: [10, 20, 30, 50, 100],
      onChange: (page: number | { page: number; pageSize: number }) => {
        if (typeof page === 'number') {
          setPagination((o: any) => ({
            ...o,
            page: page + 1,
          }));
        } else {
          setPagination((o: any) => ({
            ...o,
            page: page.page,
            pageSize: page.pageSize,
          }));
        }
      },
    }),
    []
  );

  const [open, setOpen] = useState(false);
  const [allData, setAllData] = useState<any[]>([]);
  const [filterData, setFilterData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(defaultPagination);
  const [selectedRecord, setSelectedRecord] = useState<any>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [dataTypeFilter, setDataTypeFilter] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController>(new AbortController());
  // const latestConfig = useRef<ProtocolConfig>();

  const formatMessage = useTranslate();

  const save = () => {
    if (onSubmit) {
      onSubmit(selectedRecord);
    }
    close();
  };

  const close = () => {
    // 关闭时清除已选项和取消请求，每次打开会发起新请求
    setOpen(false);
    setSelectedRecord(null);
    controller.current?.abort();
  };

  // 过滤搜索输入值或者表头过滤器选择值
  const filterAllData = useCallback(
    (value?: string) => {
      let filterItems = allData;
      const filterValue = value ?? searchValue;
      if (filterValue) {
        filterItems = filter(allData, (item) => includes(item.name, filterValue));
      }
      if (!isEmpty(dataTypeFilter)) {
        filterItems = filter(filterItems, (item) => includes(dataTypeFilter, item.dataType));
      }
      setFilterData(filterItems);
      setPagination({
        ...pagination,
        totalItems: filterItems.length,
        page: 1,
      });
    },
    [searchValue, dataTypeFilter, allData, pagination]
  );

  // 前端搜索过滤并分页
  const debounceSearch = useCallback(
    debounce((value) => {
      filterAllData(value);
      // 先不做清空
      // setSelectedRecord(null);
    }, 500),
    [filterAllData]
  );

  const handleSearchChange = (e: any) => {
    const value = e.target.value;
    setSearchValue(value);
    debounceSearch(value);
  };

  useEffect(() => {
    // 过滤器值改变触发搜索
    filterAllData();
  }, [dataTypeFilter]);

  useEffect(() => {
    // 监听pagination, filterData, selectedRecord变化，更新当前表格展示数据(前端分页)
    const { page, pageSize, totalItems } = pagination;
    if (Math.ceil(totalItems / pageSize) >= page) {
      const endIndex = pageSize * page;
      const startIndex = endIndex - pageSize;
      setDataSource(
        map(filterData.slice(startIndex, endIndex), (item) =>
          item.name === selectedRecord?.name ? { ...item, isSelected: selectedRecord?.isSelected } : item
        )
      );
    } else {
      setDataSource([]);
    }
  }, [pagination, filterData, selectedRecord]);

  useEffect(() => {
    if (open && !isEmpty(protocolConfig)) {
      // latestConfig.current = protocolConfig;
      controller.current?.abort();
      controller.current = new AbortController();
      setLoading(true);
      getProtocolTags(
        {
          protocolName: protocolConfig?.protocolName,
          serverConfig: JSON.stringify(protocolConfig?.serverConfig),
        },
        {
          signal: controller.current.signal,
        }
      )
        .then((allData: any) => {
          setAllData(allData);
          setFilterData(allData);
          setPagination({
            ...pagination,
            totalItems: allData.length,
            page: 1,
          });
          setLoading(false);
        })
        .catch((error) => {
          if (error.msg !== 'canceled') {
            setAllData([]);
            setFilterData([]);
            setLoading(false);
          }
        });
      setSearchValue('');
    }
  }, [protocolConfig, open]);

  useImperativeHandle(attrListRef, () => ({
    setOpen: setOpen,
  }));

  return (
    <ProModal
      className={classNames('attrListModalWrap', { 'information-modal-close': closeClass })}
      open={open}
      onCancel={close}
      title={modalHeading}
      size="xs"
    >
      <Search
        closeButtonLabelText="Clear search input"
        id="search"
        labelText="Label text"
        placeholder={formatMessage('uns.inputText')}
        role="searchbox"
        size="md"
        type="text"
        // style={{ '--cds-field': 'var(--supos-t-gray-color-10)' }}
        onChange={handleSearchChange}
        value={searchValue}
        className="foucs-input"
      />
      <Table
        className="attr-list-table"
        style={{
          marginTop: '20px',
          height: '407px',
        }}
        scroll={{ y: dataSource.length > 10 ? 37 * 10 : undefined }}
        size="middle"
        loading={loading}
        dataSource={dataSource}
        rowClassName={(record) =>
          classnames('small-tr', {
            'tr-selected': record.isSelected,
          })
        }
        onRow={(record) => ({
          onClick: () => {
            const isSelected = !record.isSelected;
            const selectedItem = {
              ...record,
              isSelected,
            };
            setSelectedRecord(isSelected ? selectedItem : null);
            setDataSource(
              dataSource.map((item) =>
                item.name === record.name
                  ? selectedItem
                  : {
                      ...item,
                      isSelected: false,
                    }
              )
            );
          },
        })}
        columns={[
          {
            dataIndex: 'name',
            key: 'name',
            title: formatMessage('uns.value'),
            ellipsis: true,
            width: 200,
            render: (text: string) => (
              <Paragraph copyable={{ text: text }} style={{ margin: 0 }}>
                <Text style={{ maxWidth: '90%' }} ellipsis>
                  {text}
                </Text>
              </Paragraph>
            ),
          },
          {
            dataIndex: 'dataType',
            key: 'dataType',
            title: formatMessage('uns.type'),
            ellipsis: true,
            width: 100,
            filters: map(types, (type) => ({
              text: type,
              value: type,
            })),
            // onFilter: (value: any, record: any) => record.dataType === value,
            filterDropdownProps: {
              onOpenChange: (open) => {
                setCloseClass(true);
                if (!open) {
                  const input = document.getElementById('search');
                  input?.focus?.();
                  setTimeout(() => {
                    setCloseClass(false);
                  }, 1000);
                }
              },
            },
          },
        ]}
        onChange={(_, filters) => {
          setDataTypeFilter(filters.dataType || []);
        }}
        pagination={false}
      />
      <ComPagination
        {...pagination}
        style={{
          marginBottom: '0px',
          borderBottom: '1px solid var(--cds-border-subtle)',
        }}
      />
      <div
        style={{
          fontSize: '12px',
          color: 'var(--supos-text-color)',
          height: '30px',
          lineHeight: '22px',
        }}
      >
        {selectedRecord?.name ? `${formatMessage('uns.selected')} ${selectedRecord?.name}` : ''}
      </div>

      <div className="list-modal-footer">
        <Button color="default" variant="filled" onClick={close} block>
          {formatMessage('common.cancel')}
        </Button>
        <Button color="primary" variant="solid" onClick={save} block disabled={!selectedRecord}>
          {formatMessage('common.confirm')}
        </Button>
      </div>
    </ProModal>
  );
};
export default AttributeSelector;
