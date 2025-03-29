import { Input, Form, InputNumber, FormItemProps } from 'antd';
import ComSelect from '../com-select';
import { ReactNode } from 'react';

export const render = (type: any, properties: any) => {
  switch (type) {
    case 'Input':
      return <Input {...properties} />;
    case 'TextArea':
      return <Input.TextArea rows={2} {...properties} />;
    case 'Select':
      return <ComSelect allowClear {...properties} />;
    case 'Number':
      return <InputNumber style={{ width: '100%' }} allowClear {...properties} />;
    default:
      return null;
  }
};

export interface RenderFormItemProps extends FormItemProps {
  render?: (item?: RenderFormItemProps) => ReactNode;
  type?: string;
  properties?: { [key: string]: any };
  component?: ReactNode;
}

const RenderFormItem = (item: RenderFormItemProps) => {
  const { render: renderComponent, type = 'Input', properties, component, ...restFormProps } = item;
  // 组件渲染
  if (renderComponent) {
    return renderComponent(item);
  }
  return (
    <Form.Item {...restFormProps}>{component || !restFormProps?.name ? null : render(type, properties)}</Form.Item>
  );
};

export default RenderFormItem;
