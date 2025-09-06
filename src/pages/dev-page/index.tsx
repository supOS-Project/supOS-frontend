import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import { useEffect } from 'react';
import ComFormula from '../../components/com-formula';

const DevPage = () => {
  useEffect(() => {}, []);
  return (
    <ComLayout>
      <ComContent title="test" hasBack={false}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ComFormula defaultOpenCalculator={false} />
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default DevPage;
