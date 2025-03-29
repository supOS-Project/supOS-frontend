import { FC, useEffect, useState, useRef } from 'react';
import { Form, Space, Select, Button, Divider } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import { ComFormula } from '@/components';
import SearchSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect';

const CalculationForm: FC<any> = () => {
  const [formulaList, setFormulaList] = useState<any>([]);
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const refers = Form.useWatch('refers');
  const formulaRef: any = useRef(null);

  const onChange = (e: any, options: any, index: number) => {
    const _options = options.find((option: any) => option.topic === e);
    form.setFieldValue(['refers', index, 'fields'], _options?.fields || []);
    form.setFieldValue(['refers', index, 'field'], undefined);
  };

  useEffect(() => {
    const _formulaList = refers?.map((_: any, index: number) => {
      return {
        label: `${formatMessage('uns.variable')}${index + 1}`,
        value: `a${index + 1}`,
      };
    });
    setFormulaList(_formulaList);
  }, [refers]);

  useEffect(() => {
    if (!formulaRef?.current) return;
    if (formulaList?.length > 0) {
      formulaRef?.current?.setValue(form.getFieldValue('expression'), formulaList);
    }
  }, [formulaList]);

  return (
    <>
      <div className="keyTitle">{formatMessage('uns.key')}</div>
      <Form.List name="refers">
        {(fields, { add, remove }) => {
          return (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                  }}
                  align="start"
                >
                  <div style={{ lineHeight: '32px', width: '80px' }}>
                    {formatMessage('uns.variable')}
                    {index + 1}
                  </div>
                  <Form.Item
                    {...restField}
                    name={[name, 'topic']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage('uns.pleaseInputNamespace'),
                      },
                    ]}
                    wrapperCol={{ span: 24 }}
                    style={{ width: '320px' }}
                  >
                    <SearchSelect
                      placeholder={formatMessage('uns.namespace')}
                      onChange={onChange}
                      index={index}
                      popupMatchSelectWidth={510}
                    />
                  </Form.Item>
                  <span style={{ lineHeight: '32px' }}>.</span>
                  <Form.Item
                    {...restField}
                    name={[name, 'field']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage('uns.pleaseSelectKeyType'),
                      },
                    ]}
                    wrapperCol={{ span: 24 }}
                    style={{ width: '120px' }}
                  >
                    <Select
                      placeholder={formatMessage('uns.key')}
                      options={refers?.[index]?.fields || []}
                      fieldNames={{ label: 'name', value: 'name' }}
                    ></Select>
                  </Form.Item>
                  {index > 0 && (
                    <Button
                      color="default"
                      variant="filled"
                      icon={<SubtractAlt />}
                      onClick={() => {
                        remove(name);
                        formulaRef?.current?.restValue();
                      }}
                      style={{
                        border: '1px solid #CBD5E1',
                        color: 'var(--supos-text-color)',
                        backgroundColor: 'var(--supos-uns-button-color)',
                      }}
                    />
                  )}
                </Space>
              ))}

              <Button
                color="default"
                variant="filled"
                onClick={() => add()}
                block
                style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                icon={<AddAlt size={20} />}
              />
            </>
          );
        }}
      </Form.List>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <ComFormula
        required
        formulaRef={formulaRef}
        fieldList={formulaList}
        defaultOpenCalculator={false}
        onChange={(value) => {
          form.setFieldValue('expression', value);
        }}
      />
    </>
  );
};
export default CalculationForm;
