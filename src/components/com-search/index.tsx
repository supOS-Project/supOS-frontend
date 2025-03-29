import { Button, Flex, Form, FormInstance, FormProps } from 'antd';
import { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RenderFormItem, { RenderFormItemProps } from '../operation-form/render-form-item.tsx';
import './index.scss';
import { useTranslate } from '@/hooks';
import { Search } from '@carbon/icons-react';

export interface ComSearchProps {
  form: FormInstance;
  formConfig?: FormProps;
  onSearch?: () => void;
  formItemOptions: RenderFormItemProps[];
  loading?: boolean;
}

const ComSearch: FC<ComSearchProps> = ({ form, formConfig, formItemOptions, onSearch }) => {
  const formatMessage = useTranslate();

  return (
    <Form
      className="com-search"
      labelAlign={'left'}
      colon={false}
      form={form}
      layout="inline"
      {...formConfig}
      style={{ flexWrap: 'nowrap', ...formConfig?.style }}
    >
      {formItemOptions?.map((item: any) => {
        return <RenderFormItem key={item.name || uuidv4()} {...item} />;
      })}
      <Flex gap={4}>
        <Button
          type={'primary'}
          style={{ height: 32 }}
          onClick={() => {
            onSearch?.();
          }}
        >
          <Flex gap={32} align="center">
            <span>{formatMessage('common.search')}</span>
            <Search size={14} />
          </Flex>
        </Button>
      </Flex>
    </Form>
  );
};

export default ComSearch;
