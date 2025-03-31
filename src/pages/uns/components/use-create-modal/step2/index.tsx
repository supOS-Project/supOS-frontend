import { FC, useEffect } from 'react';
import { Form, Divider } from 'antd';
import CalculationForm from './timeSeries/CalculationForm';
import { ComCheckbox } from '@/components';
import { useTranslate } from '@/hooks';
import AggForm from './timeSeries/AggForm';
import TagSelect from '@/pages/uns/components/use-create-modal/components/TagSelect';
import { useRoutesContext } from '@/contexts/routes-context.ts';

const Step2: FC<any> = () => {
  const { dashboardType } = useRoutesContext();
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();

  const dataType = Form.useWatch('dataType', form) || form.getFieldValue('dataType');
  const calculationType = Form.useWatch('calculationType', form) || form.getFieldValue('calculationType');
  const windowType =
    Form.useWatch(['streamOptions', 'window', 'windowType'], form) ||
    form.getFieldValue(['streamOptions', 'window', 'windowType']);

  useEffect(() => {
    if (dataType === 3 && calculationType === 4) {
      form.setFieldValue('save2db', true);
    }
  }, []);

  return (
    <>
      <div className="namespaceBox">
        <div className="namespaceLabel">{formatMessage('uns.namespace')}</div>
        <div className="namespaceValue">{form.getFieldValue('topic')}</div>
      </div>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <div className="formBox">
        {dataType === 3 && (
          <>
            {calculationType === 3 ? <CalculationForm /> : <AggForm />}
            <Divider style={{ borderColor: '#c6c6c6' }} />
          </>
        )}

        <Form.Item name="tags" label={formatMessage('common.label')}>
          <TagSelect />
        </Form.Item>
        <Divider style={{ borderColor: '#c6c6c6' }} />
        {dataType !== 3 && (
          <Form.Item name="addFlow" label={formatMessage('uns.autoFlow')} valuePropName="checked" initialValue={true}>
            <ComCheckbox />
          </Form.Item>
        )}
        {dashboardType?.includes('grafana') && (
          <Form.Item
            name="addDashBoard"
            label={formatMessage('uns.autoDashboard')}
            valuePropName="checked"
            initialValue={true}
          >
            <ComCheckbox />
          </Form.Item>
        )}
        <Form.Item name="save2db" label={formatMessage('uns.persistence')} valuePropName="checked">
          <ComCheckbox disabled={dataType === 3 && calculationType === 4} />
        </Form.Item>

        {dataType === 3 && calculationType === 4 && (
          <Form.Item
            name="advancedOptions"
            label={formatMessage('streams.advancedOptions')}
            valuePropName="checked"
            initialValue={false}
          >
            <ComCheckbox
              onChange={() => {
                form.setFieldValue('_advancedOptions', undefined);
              }}
              disabled={windowType === 'COUNT_WINDOW'}
            />
          </Form.Item>
        )}
      </div>
    </>
  );
};
export default Step2;
