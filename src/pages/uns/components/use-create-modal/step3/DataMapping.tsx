import { FC, useState, useEffect } from 'react';
import { Form, Flex, Select } from 'antd';
import 'react-data-mapping/dist/index.css';
import { useTranslate } from '@/hooks';

const DataMapping: FC<any> = ({ targetFields }) => {
  const [targetList, setTargetList] = useState(targetFields);
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const fields = Form.useWatch('fields') || [];

  useEffect(() => {
    const selectedList = fields.map((field: any) => field.index);
    const _targetList = targetFields.filter((target: any) => !selectedList.includes(target.value));
    setTargetList(_targetList);
  }, [fields]);

  return (
    <>
      <div className="namespaceBox">
        <div className="namespaceLabel" style={{ marginBottom: '20px' }}>
          {formatMessage('uns.dataMapping')}
        </div>
      </div>
      <Form.List name="fields">
        {(fields) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex gap={20} key={key}>
                <div className="modbusfieldsWrap" style={{ flex: 1 }}>
                  <span title={form.getFieldValue('fields')[index].name}>
                    {form.getFieldValue('fields')[index].name}
                  </span>
                </div>

                <Form.Item
                  style={{ flex: 1 }}
                  {...restField}
                  name={[name, 'index']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage('uns.pleaseInputString'),
                    },
                  ]}
                  wrapperCol={{ span: 24 }}
                >
                  <Select placeholder="Target" options={targetList} allowClear />
                </Form.Item>
              </Flex>
            ))}
          </>
        )}
      </Form.List>
    </>
  );
};
export default DataMapping;
