import { FC, useEffect } from 'react';
import { Form, Input, Divider } from 'antd';
import { ComPopupGuide } from '@/components';
import { useTranslate } from '@/hooks';
import { pinyin } from 'pinyin-pro';
import { getTemplateDetail } from '@/apis/inter-api/uns.ts';
import { verifyFileName } from '@/apis/inter-api/uns';
import FileForm from './file';
import FolderForm from './folder';

const Step1: FC<any> = ({
  types,
  addNamespaceForAi,
  setAddNamespaceForAi,
  isCreateFolder,
  uuid,
  sourcePath,
  templateList,
}) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const name = Form.useWatch('name', form);
  const modelId = Form.useWatch('modelId', form) || form.getFieldValue('modelId');

  const nameChange = (val?: string, isCreateFolder?: boolean) => {
    form.setFieldsValue({
      alias: `_${pinyin(val || '', { toneType: 'none' })
        ?.replace(/\s+/g, '')
        ?.replace(/-/g, '_')
        .slice(0, 38)}_${uuid}`,
      topic: `${sourcePath ? sourcePath : ''}${val || ''}${isCreateFolder ? '/' : ''}`,
    });
  };

  useEffect(() => {
    if (name) {
      nameChange(name, isCreateFolder);
    }
  }, [name]);

  useEffect(() => {
    if (modelId && modelId !== 'custom') {
      getTemplateDetail({ id: modelId }).then((res: any) => {
        form.setFieldValue('fields', res?.fields || []);
      });
    }
  }, [modelId]);

  const FormType = isCreateFolder ? FolderForm : FileForm;

  return (
    <div className="formBox">
      <Form.Item label={formatMessage('uns.namespace')} name="topic">
        <Input disabled />
      </Form.Item>
      <Form.Item label={formatMessage('uns.alias')} name="alias">
        <Input disabled />
      </Form.Item>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item
        name="name"
        label={
          <ComPopupGuide
            stepName={isCreateFolder ? 'namespace' : 'name'}
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
            <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.name')}</div>
          </ComPopupGuide>
        }
        validateTrigger={['onBlur', 'onChange']}
        rules={[
          { required: true, message: formatMessage('uns.pleaseInputName') },
          { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/, message: formatMessage('uns.nameFormat') },
          {
            validator: async (_, value) => {
              if (value) {
                const res = await verifyFileName({
                  folder: sourcePath ? sourcePath : undefined,
                  name: value,
                  checkType: isCreateFolder ? 1 : 2,
                });
                if (res) {
                  throw new Error(formatMessage('uns.duplicateName'));
                }
              }
            },
            validateTrigger: ['onBlur'],
          },
        ]}
      >
        <Input />
      </Form.Item>
      <FormType
        types={types}
        addNamespaceForAi={addNamespaceForAi}
        setAddNamespaceForAi={setAddNamespaceForAi}
        templateList={templateList}
      />
    </div>
  );
};
export default Step1;
