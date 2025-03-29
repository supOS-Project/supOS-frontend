import { FC } from 'react';
import TreemapChart from './treemap-chart';
import { Tag } from '@carbon/react';
import { Button } from 'antd';
import { useTranslate } from '@/hooks';

const FloatTreemap: FC<any> = ({ treeData, changeCurrentPath, open, setOpen }) => {
  const formatMessage = useTranslate();
  return (
    <div className="floatTreemapWrap">
      <div className="floatTreemapTop">
        <Tag className="some-class" size="md" title="Clear filter" type="gray">
          {formatMessage('uns.treeView')}
        </Tag>
        <Button
          color="default"
          variant="filled"
          style={{ backgroundColor: 'var(--supos-button-def-10)', color: 'var(--supos-text-color)' }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          {open ? formatMessage('uns.hideTree') : formatMessage('uns.showTree')}
        </Button>
      </div>
      <div style={{ height: open ? '600px' : '0', transition: '200ms' }}>
        <TreemapChart treeData={treeData} changeCurrentPath={changeCurrentPath} />
      </div>
    </div>
  );
};
export default FloatTreemap;
