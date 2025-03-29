import { FC, useState } from 'react';
import { Upload as UploadIcon } from '@carbon/icons-react';
import { Upload, message, Button, Form, Space, Flex } from 'antd';
import { useTranslate } from '@/hooks';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useThemeContext } from '@/contexts/theme-context';
import styles from './importConfig.module.scss';
import { formatProtocol } from '@/apis/inter-api/protocol';
import { ProModal } from '@/components';

const Module: FC<any> = (props) => {
  const { open, setOpen, setProtocolData } = props;
  const [form] = Form.useForm();
  const themeStore: any = useThemeContext();
  const formatMessage = useTranslate();
  const [loading, setLoading] = useState(false);
  const json = Form.useWatch('json', form);

  const save = () => {
    form.validateFields().then((values) => {
      formatProtocol(JSON.parse(values.json)).then((res: any) => {
        if (res) {
          setProtocolData(res);
          close();
        }
      });
    });
  };

  const close = () => {
    setOpen(false);
    form.resetFields();
    setLoading(false);
  };

  const parseJson = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const content = JSON.parse(e.target.result);
        if (Array.isArray(content)) {
          form.setFieldValue('json', JSON.stringify(content, null, 2));
          setTimeout(() => {
            form.validateFields(['json']);
          });
        } else {
          message.error(formatMessage('uns.pleaseImportTheCorrectJSONArray'));
        }
        // eslint-disable-next-line
      } catch (err) {
        message.error(formatMessage('uns.invalidJSONFile'));
      }
    };
    reader.readAsText(file);
  };

  const beforeUpload = (file: any) => {
    parseJson(file);
    return false;
  };

  const validatorJson = (_: any, value: any) => {
    if (!value) return Promise.reject(new Error(formatMessage('uns.pleaseEnterJSONArray')));
    try {
      const result = JSON.parse(value);
      return Array.isArray(result)
        ? Promise.resolve()
        : Promise.reject(new Error(formatMessage('uns.mustBeAnJSONArray')));
      // eslint-disable-next-line
    } catch (err) {
      return Promise.reject(new Error(formatMessage('uns.errorInTheSyntaxOfTheJSONArray')));
    }
  };

  const format = () => {
    try {
      const result = JSON.parse(json);
      form.setFieldValue('json', JSON.stringify(result, null, 2));
      // eslint-disable-next-line
    } catch (err) {
      message.error(formatMessage('uns.errorInTheSyntaxOfTheJSONArray'));
    }
  };
  const clear = () => {
    form.setFieldValue('json', '');
  };
  return (
    <ProModal
      aria-label=""
      className={styles.importConfigWrap}
      open={open}
      onCancel={close}
      size="sm"
      maskClosable={false}
      title={formatMessage('uns.importNode')}
    >
      <Form name="configForm" form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} colon={false}>
        <Form.Item name="upload" label={formatMessage('uns.pasteNodesBelow')}>
          <Space>
            <Upload name="jsonUpload" accept=".json" action="" beforeUpload={beforeUpload} fileList={[]}>
              <Button type="primary" icon={<UploadIcon />}>
                {formatMessage('uns.importNodeFile')}
              </Button>
            </Upload>
            <Button type="primary" onClick={format} disabled={!json}>
              {formatMessage('uns.format')}
            </Button>
            <Button type="primary" onClick={clear} disabled={!json}>
              {formatMessage('uns.clear')}
            </Button>
          </Space>
        </Form.Item>
        <Form.Item
          name="json"
          label={formatMessage('uns.JSONArray')}
          rules={[{ required: true, validator: validatorJson }]}
          validateTrigger={['onBlur', 'onChange']}
        >
          <CodeMirror
            height="300px"
            maxHeight="300px"
            theme={themeStore.theme.split('-')[0] || 'light'}
            extensions={[javascript({ jsx: true })]}
            placeholder={formatMessage('uns.pleaseEnterJSONArray')}
          />
        </Form.Item>
      </Form>
      <Flex justify="end" gap={10}>
        <Button variant="solid" onClick={close} loading={loading} disabled={loading}>
          {formatMessage('common.cancel')}
        </Button>
        <Button color="primary" variant="solid" onClick={save} loading={loading} disabled={loading}>
          {formatMessage('common.save')}
        </Button>
      </Flex>
    </ProModal>
  );
};
export default Module;
