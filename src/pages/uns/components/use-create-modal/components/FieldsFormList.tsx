import { FC, useEffect } from 'react';
import { Form, Flex, Input, Select, Button, InputNumber } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import Icon from '@ant-design/icons';
import { getDefaultFields } from '@/pages/uns/components/CONST';
import './FieldsFormList.scss';

import type { FieldItem } from '@/pages/uns/types';
import ComPopupGuide from '@/components/com-popup-guide';
import HelpTooltip from '@/components/help-tooltip';
import MainKey from '@/components/svg-components/MainKey';
import { useBaseStore } from '@/stores/base';

const { Option } = Select;

export interface FieldsFormListProps {
  types?: string[];
  disabled?: boolean;
  isCreateFolder?: boolean;
  addNamespaceForAi?: { [key: string]: any };
  setAddNamespaceForAi?: (e: any) => void;
  showMainKey?: boolean;
  showWrap?: boolean;
  showTooltip?: boolean;
  dataTypeName?: string | (string | number)[];
  fieldsName?: string | (string | number)[];
  mainKeyName?: string | (string | number)[];
  hasDefaultVal?: boolean;
}

const FieldsFormList: FC<FieldsFormListProps> = ({
  types = [],
  disabled,
  isCreateFolder,
  addNamespaceForAi,
  setAddNamespaceForAi,
  showMainKey = true,
  showWrap = true,
  showTooltip = true,
  dataTypeName = 'dataType',
  fieldsName = 'fields',
  mainKeyName = 'mainKey',
}) => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const dataType = Form.useWatch(dataTypeName, form);
  const calculationType = Form.useWatch('calculationType');
  const fieldList = Form.useWatch(fieldsName, form) || [];
  const mainKey = Form.useWatch(mainKeyName, form);
  const attributeType = Form.useWatch('attributeType', form);

  const { qualityName = 'quality', timestampName = 'timeStamp' } = useBaseStore((state) => state.systemInfo);
  const defaultFields = getDefaultFields(qualityName, timestampName);

  const setMainKey = (index?: number) => {
    form.setFieldValue(mainKeyName, index);
  };

  //重复键名校验
  const validateUnique = (_: any, value: string) => {
    const values = form.getFieldValue(fieldsName) || []; // 获取所有表单项的值
    const isDuplicate = value && values.filter((item: FieldItem) => item?.name === value).length > 1; // 检查是否有重复值

    if (isDuplicate) {
      return Promise.reject(new Error(formatMessage('uns.duplicateKeyNameTip')));
    } else {
      return Promise.resolve();
    }
  };

  //fields必填校验
  const validateFieldsRequired = (_: any, value: FieldItem[]) => {
    if ([1, 2].includes(dataType) && !isCreateFolder && value?.filter((e) => !e?.systemField).length === 0) {
      return Promise.reject(new Error(formatMessage('uns.fieldsRequiredTip')));
    } else {
      return Promise.resolve();
    }
  };

  const triggerNameFieldValidation = () => {
    const currentNames = form.getFieldValue(fieldsName);
    if (!Array.isArray(currentNames)) return;

    const fieldsToValidate = currentNames.map((_, i) => [
      ...(Array.isArray(fieldsName) ? fieldsName : [fieldsName]),
      i,
      'name',
    ]);
    setTimeout(() => {
      form.validateFields(fieldsToValidate).catch(() => {});
    }, 0);
  };

  useEffect(() => {
    const removeDefaultFields = fieldList?.filter(
      (e: FieldItem) => !(e?.systemField || [qualityName, timestampName].includes(e?.name))
    );
    if (
      !isCreateFolder &&
      [1, 3].includes(dataType) &&
      Array.isArray(fieldList) &&
      JSON.stringify(fieldList.slice(-2)) !== JSON.stringify(defaultFields)
    ) {
      form.setFieldValue(fieldsName, [...removeDefaultFields, ...defaultFields]);
    }
    if (dataType === 2 && fieldList?.some((e: FieldItem) => e?.systemField)) {
      form.setFieldValue(fieldsName, removeDefaultFields?.length > 0 ? removeDefaultFields : [{}]);
      triggerNameFieldValidation();
    }
  }, [dataType, fieldList]);

  const defaultDisabled = (item: FieldItem) => {
    const { systemField } = item || {};
    return !isCreateFolder && [1, 3].includes(dataType) && systemField;
  };

  const handleChangeType = (type: string, index: number) => {
    if (index === mainKey && !['integer', 'long', 'string'].includes(type.toLowerCase())) {
      setMainKey(undefined);
    }
    if (type.toLowerCase() !== 'string' && !isCreateFolder) {
      form.setFieldValue([fieldsName, index, 'maxLen'], undefined);
    }
  };

  const content = (
    <>
      <Flex align="center" gap={8} style={{ paddingBottom: '10px' }}>
        {setAddNamespaceForAi && addNamespaceForAi ? (
          <ComPopupGuide
            stepName={'fileFields'}
            steps={addNamespaceForAi?.steps}
            currentStep={addNamespaceForAi?.currentStep}
            placement="left"
            onBegin={(_, __, info) => form.setFieldsValue(info?.value)}
            onFinish={(_, nextStepName) => setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName })}
          >
            <div>{formatMessage('uns.key')}</div>
          </ComPopupGuide>
        ) : (
          <div>{formatMessage('uns.key')}</div>
        )}
        {showTooltip && <HelpTooltip title={formatMessage('uns.keyTooltip')} />}
      </Flex>

      <Form.Item name={mainKeyName} hidden>
        <Input />
      </Form.Item>

      <Form.List name={fieldsName} rules={[{ validator: validateFieldsRequired }]}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex key={key} gap="8px">
                {/* 主键按钮 */}
                {dataType === 2 && showMainKey && (
                  <Button
                    className={mainKey === index ? 'activeKeyIndexBtn' : 'keyIndexBtn'}
                    color="default"
                    variant="filled"
                    icon={<Icon component={MainKey} />}
                    onClick={() => setMainKey(mainKey === index ? undefined : index)}
                    style={{
                      color: 'var(--supos-text-color)',
                      backgroundColor: 'var(--supos-uns-button-color)',
                    }}
                    disabled={
                      !(
                        fieldList[index]?.type &&
                        ['integer', 'long', 'string'].includes(fieldList[index]?.type?.toLowerCase())
                      )
                    }
                  />
                )}

                {/* 字段名 */}
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[
                    { required: true, message: formatMessage('uns.pleaseInputKeyName') },
                    {
                      pattern: disabled ? /./s : /^[A-Za-z][A-Za-z0-9_]*$/,
                      message: formatMessage('uns.keyNameFormat'),
                    },
                    { validator: validateUnique }, // 添加自定义校验规则
                    {
                      max: 63,
                      message: formatMessage('uns.labelMaxLength', { label: formatMessage('common.name'), length: 63 }),
                    },
                  ]}
                  wrapperCol={{ span: 24 }}
                  style={{ flex: 1 }}
                >
                  <Input
                    disabled={disabled || defaultDisabled(fieldList[index])}
                    placeholder={formatMessage('common.name')}
                    title={fieldList?.[index]?.name || formatMessage('common.name')}
                    onChange={triggerNameFieldValidation}
                  />
                </Form.Item>

                {/* 类型选择 */}
                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  rules={[{ required: true, message: formatMessage('uns.pleaseSelectKeyType') }]}
                  wrapperCol={{ span: 24 }}
                  style={{ width: '110px' }}
                >
                  <Select
                    disabled={disabled || defaultDisabled(fieldList[index])}
                    placeholder={formatMessage('uns.type')}
                    title={fieldList?.[index]?.type || formatMessage('uns.type')}
                    onChange={(type) => handleChangeType(type, index)}
                  >
                    {(dataType === 3 ? types.slice(0, 4) : types).map((e: string) => (
                      <Option key={e} value={e}>
                        {e}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* 最大长度 */}
                <Form.Item {...restField} name={[name, 'maxLen']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                  <InputNumber
                    disabled={
                      disabled ||
                      fieldList?.[index]?.type?.toLowerCase() !== 'string' ||
                      defaultDisabled(fieldList[index])
                    }
                    style={{ width: '100%' }}
                    min={1}
                    max={10485760}
                    step={1}
                    precision={0}
                    placeholder={formatMessage('common.length')}
                    title={fieldList?.[index]?.maxLen || formatMessage('common.length')}
                  />
                </Form.Item>

                {/* 显示名称 */}
                <Form.Item {...restField} name={[name, 'displayName']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                  <Input
                    disabled={disabled || defaultDisabled(fieldList[index])}
                    placeholder={`${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`}
                    title={
                      fieldList?.[index]?.displayName ||
                      `${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`
                    }
                  />
                </Form.Item>

                {/* 备注 */}
                <Form.Item {...restField} name={[name, 'remark']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                  <Input
                    disabled={disabled || defaultDisabled(fieldList[index])}
                    placeholder={`${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`}
                    title={
                      fieldList?.[index]?.remark || `${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`
                    }
                  />
                </Form.Item>

                {/* 删除按钮 */}
                {!disabled && !(dataType === 3 && calculationType === 3) && !defaultDisabled(fieldList[index]) ? (
                  <Button
                    color="default"
                    variant="filled"
                    icon={<SubtractAlt />}
                    onClick={() => {
                      remove(name);
                      form.setFieldValue('functions', undefined);
                      if (mainKey === index) setMainKey(undefined);
                      triggerNameFieldValidation();
                    }}
                    style={{ border: '1px solid #CBD5E1' }}
                    disabled={fields.length === 1 && !isCreateFolder}
                  />
                ) : dataType !== 3 && calculationType !== 3 && defaultDisabled(fieldList[index]) && !disabled ? (
                  <span style={{ width: '32px' }} />
                ) : null}
              </Flex>
            ))}

            {/* 基于template创建自定义字段 */}
            {attributeType === 2 && (
              <Button
                color="default"
                variant="filled"
                onClick={() => {
                  if (dataType && dataType !== 3) {
                    form.setFieldValue('attributeType', 1);
                  } else {
                    form.setFieldsValue({
                      modelId: 'custom',
                    });
                  }
                }}
                block
                icon={<AddAlt size={20} />}
              />
            )}
            {/* 新增按钮 */}
            {!disabled && (dataType !== 3 || (dataType === 3 && calculationType === 4)) && (
              <Button
                color="default"
                variant="filled"
                onClick={() => {
                  if (!isCreateFolder && dataType === 1) {
                    const insertIndex = fields.length - 2 > 0 ? fields.length - 2 : 0;
                    add({}, insertIndex);
                  } else {
                    add();
                  }
                  form.setFieldValue('functions', undefined);
                }}
                block
                icon={<AddAlt size={20} />}
              />
            )}
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </>
  );

  return showWrap ? <div className="dashedWrap">{content}</div> : content;
};
export default FieldsFormList;
