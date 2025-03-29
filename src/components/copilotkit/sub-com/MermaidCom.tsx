import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ProModal } from '@/components';
import CommonTextMessage from './CommonTextMessage';

const Mermaid = ({ code }: any) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const graphDivRef = useRef<any>(null);
  const graphPreviewRef = useRef<any>(null);

  useEffect(() => {
    if (code) {
      mermaid
        .parse(code)
        .then(() => {
          setIsInvalid(false);
          mermaid.render(`mermaid-${new Date().valueOf()}`, code).then(({ svg }) => {
            console.log('mermaid', code, svg);
            graphDivRef.current.innerHTML = svg;
          });
        })
        .catch((error) => {
          console.log('error', error);
          setIsInvalid(true);
        });
    }
  }, [code]);

  // useEffect(() => {
  //   // mermaid.contentLoaded();
  // }, []);

  return (
    <div>
      {isInvalid ? (
        <CommonTextMessage>Load Fail</CommonTextMessage>
      ) : (
        <>
          <ProModal
            // title="Basic Modal"
            forceRender
            open={isModalOpen}
            onOk={() => {
              setIsModalOpen(false);
            }}
            onCancel={() => {
              setIsModalOpen(false);
            }}
          >
            <div ref={graphPreviewRef}></div>
          </ProModal>
          <div
            ref={graphDivRef}
            onClick={() => {
              setIsModalOpen(true);
              graphPreviewRef.current.innerHTML = graphDivRef.current?.innerHTML;
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default Mermaid;
