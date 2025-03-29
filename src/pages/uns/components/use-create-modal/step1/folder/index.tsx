import { FC } from 'react';
import { Form, Input, Divider, Select } from 'antd';
import { ComPopupGuide, ComCheckbox } from '@/components';
import { useTranslate } from '@/hooks';
import RelationalFormList from './../RelationalFormList';

const { TextArea } = Input;

const FolderForm: FC<any> = ({ addNamespaceForAi, setAddNamespaceForAi, templateList, types }) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();

  const modelId = Form.useWatch('modelId', form) || form.getFieldValue('modelId');
  const fields = Form.useWatch('fields', form) || form.getFieldValue('fields') || [];

  return (
    <>
      <Form.Item
        name="modelDescription"
        label={
          <ComPopupGuide
            stepName="modelDescription"
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
            <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('uns.folderDescription')}</div>
          </ComPopupGuide>
        }
      >
        <TextArea rows={2} placeholder="" />
      </Form.Item>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item name="modelId" label={formatMessage('common.template')} initialValue="custom">
        <Select
          showSearch
          optionFilterProp="path"
          options={templateList}
          fieldNames={{ label: 'path', value: 'id' }}
          onChange={(modelId) => {
            form.setFieldValue('mainKey', undefined);
            if (modelId === 'custom' || !modelId) {
              form.setFieldValue('fields', undefined);
            }
          }}
        />
      </Form.Item>
      {modelId === 'custom' && fields?.length > 0 && (
        <Form.Item
          name="exportTemplate"
          label={formatMessage('uns.generationTemplate')}
          valuePropName="checked"
          initialValue={true}
        >
          <ComCheckbox />
        </Form.Item>
      )}
      <div style={{ padding: '20px', border: '1px dashed #C6C6C6', borderRadius: '6px' }}>
        <RelationalFormList
          types={types}
          disabled={modelId !== 'custom'}
          isCreateFolder
          addNamespaceForAi={addNamespaceForAi}
          setAddNamespaceForAi={setAddNamespaceForAi}
        />
      </div>
    </>
  );
};
export default FolderForm;
