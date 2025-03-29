import { FC } from 'react';
import { Form, Input, Divider, Select } from 'antd';
import { ComRadio } from '@/components';
import AggregationForm from './AggregationForm';
import RelationalFormList from './../RelationalFormList';
import { ComPopupGuide } from '@/components';
import { useTranslate } from '@/hooks';
import ReverseGeneration from './ReverseGeneration';

const { TextArea } = Input;

const FileForm: FC<any> = ({ addNamespaceForAi, setAddNamespaceForAi, templateList, types }) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const dataType = Form.useWatch('dataType', form) || form.getFieldValue('dataType');
  const attributeType = Form.useWatch('attributeType', form) || form.getFieldValue('attributeType');
  const modelId = Form.useWatch('modelId', form) || form.getFieldValue('modelId');

  return (
    <>
      <Form.Item
        name="instanceDescription"
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="instanceDescription"
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            {formatMessage('uns.fileDescription')}
          </ComPopupGuide>
        }
      >
        <TextArea rows={2} placeholder="" />
      </Form.Item>
      <Form.Item
        name="dataType"
        label={
          <ComPopupGuide
            stepName="dataType"
            steps={addNamespaceForAi?.steps}
            currentStep={addNamespaceForAi?.currentStep}
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            <span style={{ color: 'var(--supos-text-color)' }}>{formatMessage('uns.databaseType')}</span>
          </ComPopupGuide>
        }
      >
        <ComRadio
          options={[
            { label: formatMessage('uns.timeSeries'), value: 1 },
            { label: formatMessage('uns.relational'), value: 2 },
            { label: formatMessage('uns.calculation'), value: 3 },
            { label: formatMessage('uns.aggregation'), value: 6 },
          ]}
          onChange={() => {
            form.setFieldsValue({
              fields: [{}],
              refers: [{}],
              protocol: undefined,
              frequency: undefined,
              aggregationModel: undefined,
              referTopics: undefined,
              mainKey: undefined,
              attributeType: 1,

              modelId: undefined,
              jsonData: undefined,
              jsonList: [],
              jsonDataPath: undefined,
              source: undefined,
              dataSource: undefined,
              table: undefined,
              next: false,
            });
          }}
        />
      </Form.Item>

      {dataType === 6 ? ( //聚合
        <AggregationForm />
      ) : (
        <>
          {dataType === 3 && ( //计算型
            <Form.Item name="calculationType" label={formatMessage('uns.calculationType')}>
              <ComRadio
                options={[
                  { label: formatMessage('uns.realtime'), value: 3 },
                  // { label: formatMessage('uns.history'), value: 4 },
                ]}
                onChange={() => {
                  form.setFieldsValue({ fields: [{}] });
                }}
              />
            </Form.Item>
          )}
          <Divider style={{ borderColor: '#c6c6c6' }} />
          {dataType < 3 && ( //时序或关系型
            <>
              <Form.Item name="attributeType" label={formatMessage('uns.attributeGenerationMethod')} initialValue={1}>
                <ComRadio
                  options={[
                    { label: formatMessage('common.custom'), value: 1 },
                    { label: formatMessage('common.template'), value: 2 },
                    { label: formatMessage('uns.reverseGeneration'), value: 3 },
                  ]}
                  onChange={() => {
                    form.setFieldsValue({
                      fields: [{}],

                      modelId: undefined,
                      jsonData: undefined,
                      jsonList: [],
                      jsonDataPath: undefined,
                      source: undefined,
                      dataSource: undefined,
                      table: undefined,
                      next: false,
                    });
                  }}
                />
              </Form.Item>
            </>
          )}
          <div style={{ padding: '20px', border: '1px dashed #C6C6C6', borderRadius: '6px' }}>
            {attributeType === 1 && (
              <RelationalFormList
                types={types}
                addNamespaceForAi={addNamespaceForAi}
                setAddNamespaceForAi={setAddNamespaceForAi}
              />
            )}
            {attributeType === 2 && (
              <>
                <Form.Item name="modelId" label={formatMessage('common.template')} rules={[{ required: true }]}>
                  <Select
                    showSearch
                    optionFilterProp="path"
                    options={templateList.slice(1)}
                    fieldNames={{ label: 'path', value: 'id' }}
                  />
                </Form.Item>
                {modelId && (
                  <RelationalFormList
                    types={types}
                    disabled={modelId}
                    addNamespaceForAi={addNamespaceForAi}
                    setAddNamespaceForAi={setAddNamespaceForAi}
                  />
                )}
              </>
            )}
            {attributeType === 3 && (
              <ReverseGeneration
                types={types}
                addNamespaceForAi={addNamespaceForAi}
                setAddNamespaceForAi={setAddNamespaceForAi}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};
export default FileForm;
