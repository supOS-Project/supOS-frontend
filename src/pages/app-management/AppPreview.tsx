import { FC, useEffect, useRef, useState } from 'react';
import { ComLayout, ComContent, ComDrawer, CodeEditorWithPreview, CodeEditor } from '@/components';
import { Button, Flex } from 'antd';
import { getSingleHtml } from '@/apis/inter-api/apps';
import { getFileName } from '@/utils';
import DeployForm from '@/pages/app-management/components/DeployForm';
import beautify from 'js-beautify';
import { useSize } from 'ahooks';
import { PageProps } from '@/common-types';
import { useTranslate } from '@/hooks';

const AppPreview: FC<PageProps> = ({ location }) => {
  const formatMessage = useTranslate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { state } = location || {};
  const ref = useRef(null);
  const size = useSize(ref);
  useEffect(() => {
    if (state) {
      const html = getFileName(state?.htmlName);
      setLoading(true);
      getSingleHtml(state?.appName, html)
        .then((data: any) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          setContent(beautify.html(data?.content, { indent_size: 2, space_in_empty_paren: true }));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, state);
  return (
    <ComLayout loading={loading}>
      <ComContent
        title={
          <Flex justify="flex-end" align="center" style={{ height: '100%' }}>
            <Button style={{ width: 102 }} type="primary" onClick={() => setShow((pre) => !pre)}>
              {formatMessage('appGui.deploy')}
            </Button>
          </Flex>
        }
      >
        <Flex style={{ height: '100%', padding: '40px 20px' }} gap={10}>
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }} ref={ref}>
            <CodeEditor height={size?.height} width={size?.width} code={content} setCode={setContent} />
          </div>
          <div style={{ flex: 1 }}>
            <CodeEditorWithPreview code={content} setCode={setContent} />
          </div>
        </Flex>
      </ComContent>
      <ComDrawer title=" " open={show} onClose={() => setShow(false)}>
        <DeployForm
          show={show}
          setShow={setShow}
          appName={state?.appName}
          htmlName={state?.htmlName}
          htmlContent={content}
        />
      </ComDrawer>
    </ComLayout>
  );
};

export default AppPreview;
