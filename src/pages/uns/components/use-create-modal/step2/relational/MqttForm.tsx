import { FC, useCallback, useRef, useState } from 'react';
import { Form, Input, Select, Spin } from 'antd';
import { useTranslate } from '@/hooks';
import { getProtocolTags } from '@/apis/inter-api/protocol';
import { debounce } from 'lodash';

const MqttForm: FC<any> = ({ serverDetail }) => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const controller = useRef<AbortController>(new AbortController());

  const getOptions = useCallback(
    (topic?: string) => {
      if (serverDetail?.server) {
        controller.current?.abort();
        controller.current = new AbortController();
        setLoading(true);
        getProtocolTags(
          {
            protocolName: serverDetail?.protocolName,
            serverConfig: JSON.stringify({ server: serverDetail?.server }),
            topic,
          },
          {
            signal: controller.current.signal,
          }
        )
          .then((allData: any) => {
            setOptions(allData);
            setLoading(false);
          })
          .catch((error) => {
            if (error.msg !== 'canceled') {
              setOptions([]);
              setLoading(false);
            }
          });
      } else {
        setOptions([]);
      }
    },
    [serverDetail]
  );

  const debounceSearchRequest = useCallback(
    debounce((keyword: string) => {
      getOptions(keyword);
    }, 500),
    [getOptions]
  );

  const handleSelectSearch = (val: string) => {
    setSearchValue(val);
    debounceSearchRequest(val); // 调接口搜索的方法
  };

  const handleSelectBlur = () => {
    let inputValue = searchValue;
    // 当是选中值的时候，就没有searchValue，所以需要通过原生获取节点的值
    if (!inputValue) {
      inputValue = form.getFieldValue(['protocol', 'inputTopic']);
    }
    // 绑定值到表单上
    form.setFieldValue(['protocol', 'inputTopic'], inputValue);
  };

  const handleDropdownChange = (visible: boolean) => {
    if (visible) {
      getOptions();
    } else {
      setTimeout(() => {
        controller.current?.abort();
      }, 600);
    }
  };

  return (
    <>
      <Form.Item
        name={['protocol', 'inputTopic']}
        label={formatMessage('uns.inputTopic')}
        initialValue={''}
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          allowClear
          options={loading ? [] : options}
          fieldNames={{
            label: 'name',
            value: 'name',
          }}
          notFoundContent={loading ? <Spin size="small" /> : undefined}
          onDropdownVisibleChange={handleDropdownChange}
          onSearch={handleSelectSearch}
          onBlur={handleSelectBlur}
          onChange={() => {
            setSearchValue('');
          }}
          onInputKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
            }
          }}
        />
      </Form.Item>
      <Form.Item name={['protocol', 'inputName']} label={formatMessage('uns.inputName')} initialValue={''}>
        <Input />
      </Form.Item>
    </>
  );
};
export default MqttForm;
