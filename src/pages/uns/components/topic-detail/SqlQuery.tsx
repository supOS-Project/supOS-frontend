import { FC, useEffect, useState } from 'react';
import { CodeSnippet } from '@carbon/react';
import GraphiQLWrap from './GraphiQLWrap';
import UploadData from './UploadData.tsx';
import { useTranslate } from '@/hooks';
import FetchData from '@/pages/uns/components/topic-detail/FetchData';
import TDengineData from '@/pages/uns/components/topic-detail/TDengineData.tsx';
import { useRoutesContext } from '@/contexts/routes-context.ts';

const SqlQuery: FC<any> = ({ instanceInfo, currentPath }) => {
  const formatMessage = useTranslate();
  const { dashboardType, dataBaseType } = useRoutesContext();
  const [activeTab, setActiveTab] = useState('');
  const [list, setList] = useState<string[]>([]);
  const getSQL = () => {
    let code = '';
    if (instanceInfo.fields && activeTab === 'Grafana') {
      if (instanceInfo.dataType === 2) {
        code = `select * from "public"."${instanceInfo.alias}" limit 10`;
      } else {
        code = `select _ct,${instanceInfo.fields.map((e: any) => e.name)} from \`public\`.\`${instanceInfo.alias}\` where \`_ct\` > NOW - 2h;`;
      }
    }
    return code;
  };
  const reset = () => {
    document.querySelector('.topicDetailContent')?.scrollTo(0, 0);
  };
  useEffect(() => {
    if (currentPath) {
      reset();
      getShowDiv(instanceInfo.dataType);
    }
  }, [currentPath, instanceInfo.dataType]);

  const getShowDiv = (type: number) => {
    let list: string[] = [];
    switch (type) {
      case 1:
        list = dataBaseType?.includes('tdengine')
          ? ['Grafana', 'TDengine', formatMessage('uns.upload'), formatMessage('uns.fetch')]
          : ['Grafana', formatMessage('uns.upload'), formatMessage('uns.fetch')];
        break;
      case 2:
        list = ['Grafana', 'GraphQL', formatMessage('uns.upload'), formatMessage('uns.fetch')];
        break;
      default:
        list = ['Grafana', formatMessage('uns.upload'), formatMessage('uns.fetch')];
        break;
    }
    const _l = dashboardType?.includes('grafana') ? list : list.slice(1);
    setList(_l);
    setActiveTab(_l?.[0] ?? '');
  };
  return (
    <>
      <div className="switchWrap">
        <span className="selectedBg" />
        {list.map((e) => (
          <div
            key={e}
            className={activeTab === e ? 'active' : ''}
            onClick={() => {
              setActiveTab(e);
            }}
          >
            {e}
          </div>
        ))}
      </div>
      {activeTab === 'Grafana' ? (
        <CodeSnippet
          className="codeViewWrap"
          type="multi"
          feedback={formatMessage('uns.copiedToClipboard')}
          minCollapsedNumberOfRows={1}
          align="top-right"
          showLessText={formatMessage('uns.showLess')}
          showMoreText={formatMessage('uns.showMore')}
          aria-label={formatMessage('uns.copyToClipboard')}
          copyButtonDescription={formatMessage('uns.copyToClipboard')}
        >
          {getSQL()}
        </CodeSnippet>
      ) : activeTab === formatMessage('uns.upload') ? (
        <UploadData instanceInfo={instanceInfo} />
      ) : activeTab === formatMessage('uns.fetch') ? (
        <FetchData instanceInfo={instanceInfo} />
      ) : activeTab === 'TDengine' ? (
        <TDengineData />
      ) : (
        <GraphiQLWrap alias={instanceInfo.alias || ''} />
      )}
    </>
  );
};
export default SqlQuery;
