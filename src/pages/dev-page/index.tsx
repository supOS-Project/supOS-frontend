import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';

const DevPage = () => {
  return (
    <ComLayout>
      <ComContent title="test" hasBack={false}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}></div>
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default DevPage;
