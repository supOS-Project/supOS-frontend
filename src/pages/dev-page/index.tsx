import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import { useEffect, useState } from 'react';
import ProCard from '@/components/pro-card/ProCard.tsx';
import ProCardContainer from '../../components/pro-card/ProCardContainer.tsx';
import { InputNumber } from 'antd';
import ComButton from '../../components/com-button';

const DevPage = () => {
  useEffect(() => {}, []);
  const [number, setN] = useState(2);
  return (
    <ComLayout>
      <ComContent
        title="test"
        hasBack={false}
        extra={
          <InputNumber
            max={20}
            onChange={(e) => {
              setN((e as number) ?? 2);
            }}
          />
        }
      >
        <ComButton
          auth={'fas'}
          onClick={() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                return resolve(true);
              }, 5000);
            });
          }}
        >
          测试
        </ComButton>
        <div style={{ height: '100%' }}>
          <ProCardContainer>
            {Array.from(Array(number)).map((i) => {
              return (
                <ProCard
                  allowHover={true}
                  key={i}
                  statusHeader={{ statusInfo: { label: '1', title: '2', color: 'red' }, allowCheck: true }}
                  header={{
                    title: '123',
                    titleDescription: '34123',
                  }}
                  onClick={() => {}}
                  description="34124531255513213412453125551321341245312555132134124531255513213412453125551321341245312555132134124531255513213412453125551321341245312555132134124531255513213412453125551321341245312555132134124531255513213412453125551321341245312555132134124531255513213412453125551321341245312555132134124531255513213412453125551321"
                />
              );
            })}
          </ProCardContainer>
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default DevPage;
