import { FC, ReactNode } from 'react';
import { Button, Divider, Flex, Form, FormInstance, FormProps, Typography } from 'antd';
import RenderFormItem, { RenderFormItemProps } from '../operation-form/render-form-item';
import { useTranslate } from '@/hooks';
import { v4 as uuidv4 } from 'uuid';
import './index.scss';

const { Title } = Typography;

export interface OperationFormProps {
  form: FormInstance;
  formConfig?: FormProps;
  onSave: () => void;
  onCancel: () => void;
  formItemOptions: RenderFormItemProps[];
  title?: ReactNode;
  loading?: boolean;
}

const OperationForm: FC<OperationFormProps> = ({
  form,
  formConfig,
  onSave,
  onCancel,
  formItemOptions,
  title,
  loading,
}) => {
  const formatMessage = useTranslate();

  return (
    <Form
      labelAlign={'left'}
      className={'operation-form'}
      style={{ padding: '20px 40px', overflow: 'hidden' }}
      colon={false}
      labelCol={{ span: 11 }}
      wrapperCol={{ span: 13 }}
      {...formConfig}
      form={form}
    >
      {title && (
        <Typography style={{ marginBottom: 40 }}>
          <Title level={4}>{title}</Title>
        </Typography>
      )}
      {formItemOptions?.map((item: any) => {
        if (item.type === 'divider') {
          return <Divider key={uuidv4()} style={{ background: '#c6c6c6' }}></Divider>;
        }
        return <RenderFormItem key={item.name || uuidv4()} {...item} />;
      })}

      <Flex justify="flex-end" gap="10px">
        <Button
          style={{ width: 76, height: 30, backgroundColor: 'rgba(0, 0, 0, 0.04)', color: 'var(--supos-text-color)' }}
          color="default"
          variant="filled"
          onClick={onCancel}
        >
          {formatMessage('common.cancel')}
        </Button>
        <Button style={{ width: 76, height: 30 }} type="primary" variant="solid" onClick={onSave} loading={loading}>
          {formatMessage('common.save')}
        </Button>
      </Flex>
    </Form>
  );
};

export default OperationForm;
