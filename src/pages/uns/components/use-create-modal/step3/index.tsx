import { FC } from 'react';
import { Form } from 'antd';
import DataMapping from './DataMapping';
import AdvancedOptions from './AdvancedOptions';

const Step3: FC<any> = ({ targetFields }) => {
  const form = Form.useFormInstance();
  const protocol = (Form.useWatch('protocol', form) || form.getFieldValue('protocol'))?.protocol;
  return protocol === 'rest' ? <DataMapping targetFields={targetFields} /> : <AdvancedOptions />;
};
export default Step3;
