import { FC, useState } from 'react';
import { ModelAlt, WatsonHealth3DCursor, MessageQueue, FlowConnection } from '@carbon/icons-react';
import { useDeepCompareEffect } from 'ahooks';
import { useTranslate } from '@/hooks';
import UnsTopology from './uns-topology';
import { useMediaSize } from '@/hooks';

const Dashboard: FC<any> = ({ topologyData }) => {
  const [datas, setDatas] = useState({});
  const formatMessage = useTranslate();
  const { isH5 } = useMediaSize();

  const [overviewList, setOverviewList] = useState<any>([
    { key: 'Folder', label: formatMessage('uns.totalModel'), icon: <ModelAlt size={24} />, value: 0 },
    {
      key: 'File',
      label: formatMessage('uns.totalInstance'),
      icon: <WatsonHealth3DCursor size={24} />,
      value: 0,
    },
    {
      key: 'allConnections',
      label: formatMessage('uns.allConnections'),
      icon: <FlowConnection size={24} />,
      value: 0,
    },
    {
      key: 'liveConnections',
      label: formatMessage('uns.liveConnections'),
      icon: <MessageQueue size={24} />,
      value: 0,
    },
  ]);

  useDeepCompareEffect(() => {
    const newData = handleData(topologyData);
    setOverviewList(newData);
    setDatas(topologyData.protocol || {});
  }, [topologyData]);

  // 数据处理
  const handleData = (data: any) => {
    const result: { [key: string]: string } = {}; // 明确指定result的类型，这里假设值都是string类型，可根据实际情况修改类型
    Object.keys(data).forEach((key) => {
      result[key.toLowerCase()] = data[key];
    });
    const updatedOverviewList = overviewList.map((item: any) => {
      const key = item.key.split(' ').pop().toLowerCase(); // 获取label中的关键单词并转为小写
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        return {
          ...item,
          value: result[key],
        };
      }
      return item;
    });
    return updatedOverviewList;
  };
  return (
    <div className="unsDashboardWrap">
      <div className="unsDashboardTop">
        <div className="overviewTitle">{formatMessage('uns.overview')}</div>
        <div className="overviewWrap">
          {overviewList?.map((e: any, i: number) => {
            return (
              <div className="overviewItem" key={i}>
                <div className="overviewItemTop">
                  <div className="overviewLabel">{e.label}</div>
                  {e.icon}
                </div>
                <div className="overviewValue">{e.value}</div>
              </div>
            );
          })}
        </div>
      </div>
      {isH5 ? null : (
        <div className="unsDashboardBottom">
          <UnsTopology datas={datas} />
        </div>
      )}
    </div>
  );
};
export default Dashboard;
