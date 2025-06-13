import { useEffect, useState, useRef } from 'react';
import { Form, Space, Select, Button, Divider, Flex } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import SearchSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect';

import type { FieldItem } from '@/pages/uns/types';
import ComFormula from '@/components/com-formula';
import HelpTooltip from '@/components/help-tooltip';

type ReferType = { label: string; value: string };
type ReferItemType = {
  refer: ReferType;
  option?: { fields: FieldItem };
};

const CalculationForm = () => {
  const [formulaList, setFormulaList] = useState<any>([]);
  const [timeReferenceOptions, setTimeReferenceOptions] = useState<ReferType[]>([]);
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const refers = Form.useWatch('refers');
  const expression = Form.useWatch('expression', form);
  const timeReference = Form.useWatch('timeReference', form);
  const formulaRef: any = useRef(null);

  const onChange = (e: ReferItemType, index: number) => {
    form.setFieldValue(['refers', index, 'fields'], e?.option?.fields || []);
    form.setFieldValue(['refers', index, 'field'], undefined);
  };

  useEffect(() => {
    const _formulaList = refers?.map((_: ReferItemType, index: number) => {
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

  useEffect(() => {
    const _timeReferenceOptions: ReferType[] = [];

    refers?.forEach((item: ReferItemType, index: number) => {
      if (item && item?.refer?.value && expression?.includes(`$a${index + 1}#`)) {
        _timeReferenceOptions.push(item.refer);
      }
    });
    setTimeReferenceOptions(_timeReferenceOptions);

    //选中的时间引用不在表达式或refers中则清空
    if (timeReference && !_timeReferenceOptions.some((item) => timeReference === item?.value)) {
      form.setFieldValue('timeReference', undefined);
    }
  }, [refers, expression, timeReference]);

  return (
    <>
      <Form.Item name="expression" hidden>
        <div />
      </Form.Item>
      <Flex align="center" gap={8} style={{ paddingBottom: '10px' }}>
        <div>{formatMessage('uns.key')}</div>
        <HelpTooltip title={formatMessage('uns.variablePickerTooltip')} />
      </Flex>
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
                  <Flex style={{ lineHeight: '32px', width: '90px' }} align="center" gap={8}>
                    <div>
                      {formatMessage('uns.variable')}
                      {index + 1}
                    </div>
                  </Flex>
                  <Form.Item
                    {...restField}
                    name={[name, 'refer']}
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
                      onChange={(e) => onChange(e, index)}
                      popupMatchSelectWidth={510}
                      labelInValue
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
                    />
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
        showTooltip
      />
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item
        name="timeReference"
        label={formatMessage('uns.reference')}
        tooltip={{ title: formatMessage('uns.timeReferenceTooltip') }}
      >
        <Select options={timeReferenceOptions} allowClear />
      </Form.Item>
    </>
  );
};
export default CalculationForm;
