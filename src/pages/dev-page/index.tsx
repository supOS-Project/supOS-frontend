import { ComLayout, ComContent, ComFormula, ComRadio, ProModal, ComCheckbox } from '@/components';
import { useRef, useState } from 'react';
import { Button } from 'antd';
import { InlineLoading } from '@/components';

const DevPage = () => {
  const ref = useRef<any>();
  const [v, setV] = useState(1);
  const [t, setT] = useState(false);
  return (
    <ComLayout>
      <ComContent title="test" hasBack={false}>
        <div style={{ width: '600px' }}>
          <ComFormula
            formulaRef={ref}
            fieldList={[{ label: 'a.bb', value: 'a.bb' }]}
            defaultOpenCalculator={true}
            onChange={(value, errorMsg) => {
              console.log(value, errorMsg);
            }}
          />
          {/*<ComFormula formulaRef={ref} fieldList={[{ label: 'a1', value: 'a.bb' }]} value={'$a.bb#'} readonly />*/}
        </div>
        <Button
          onClick={() => {
            ref.current?.restValue();
          }}
        >
          清空
        </Button>
        <Button
          onClick={() => {
            ref.current?.setValue('$a.bb#', [{ label: 'a1', value: 'a.bb' }]);
          }}
        >
          设置
        </Button>
        <ComRadio
          direction={'vertical'}
          value={v}
          onChange={(e) => {
            setV(e.target.value);
          }}
          options={[
            { value: 1, label: 1, description: '123' },
            { value: 2, label: 2 },
            { value: 3, label: 3 },
            { value: 6, label: 4 },
          ]}
        />
        <ProModal onCancel={() => setT(false)} open={t} />
        <Button
          onClick={() => {
            setT((t) => !t);
          }}
        >
          打开弹框
        </Button>
        <ComCheckbox label="123" />
        <InlineLoading status="active" description="Loading data..." />
      </ComContent>
    </ComLayout>
  );
};

export default DevPage;
