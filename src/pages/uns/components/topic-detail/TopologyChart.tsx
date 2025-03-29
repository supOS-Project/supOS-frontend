import { useRef, useEffect, useState, FC } from 'react';
import { Graph, Markup } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { ApplicationWeb, Launch } from '@carbon/icons-react';
import tdengine from '@/assets/home-icons/tdengine.png';
import postgresql from '@/assets/home-icons/postgresql.svg';
import nodeRed from '@/assets/home-icons/node-red.svg';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@/hooks';
import styles from './TopologyChart.module.scss';
import { goFlow } from '@/apis/inter-api/flow';
// import { Button, Tooltip } from 'antd';
import { Button } from 'antd';
import { ComFormula } from '@/components';
import { getTopologyStatus } from '@/apis/inter-api/uns';
import c2 from '@/assets/uns/cw.svg';
import error from '@/assets/uns/error.svg';
import ReactDOM from 'react-dom/client'; // React 18 使用 'react-dom/client'
import { getSearchParamsString, simpleFormat, formatTimestamp } from '@/utils';
import { debounce } from 'lodash';
import md5 from 'blueimp-md5';
import { useDeepCompareEffect } from 'ahooks';
import classNames from 'classnames';
import I18nStore from '@/stores/i18n-store';
import { getRefreshList, getSourceList } from '@/apis/chat2db';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import timescaleDB from '@/assets/home-icons/timescaleDB.svg';

const Modbus = (data: any) => {
  const { protocol } = data.node.data.protocol || {};
  return (
    <div
      className={classNames(styles['common-node'], styles['common-node-hover'], {
        [styles['activeBg']]: data.node.data.active,
      })}
    >
      {protocol == 'rest' ? 'Restful API' : protocol || 'Input'}
    </div>
  );
};

const NodeRed: FC<any> = (data) => {
  return (
    <div
      className={classNames(styles['common-node'], styles['common-node-hover'], {
        [styles['activeBg']]: data.node.data.active,
      })}
    >
      <img src={nodeRed} alt="" width="28px" />
      {I18nStore.getIntl('common.nodeRed', 'Node-Red')}
    </div>
  );
};

const Mqtt = (data: any) => {
  return (
    <div
      className={classNames(styles['common-node'], styles['common-node-hover'], {
        [styles['activeBg']]: data.node.data.active,
      })}
    >
      MQTT Broker
    </div>
  );
};
const TDEngine = (data: any) => {
  const { dataBaseType } = useRoutesContext();
  return (
    <div
      className={classNames(styles['common-node'], styles['common-node-hover'], {
        [styles['activeBg']]: data.node.data.active,
      })}
    >
      {data.node.data.dataType === 2 ? (
        <>
          <img src={postgresql} alt="" width="28px" />
          PostgreSQL
        </>
      ) : (
        <>
          <img src={dataBaseType.includes('tdengine') ? tdengine : timescaleDB} width="28px" />
          {dataBaseType.includes('tdengine') ? 'TDEngine' : 'TimescaleDB'}
        </>
      )}
    </div>
  );
};
const Apps = (data: any) => {
  return (
    <div
      className={classNames(styles['common-node'], styles['common-node-hover'], {
        [styles['activeBg']]: data.node.data.active,
      })}
    >
      <ApplicationWeb size={28} />
      {I18nStore.getIntl('common.apps', 'APPs')}
    </div>
  );
};
const Modbus1: FC<any> = ({ instanceInfo }) => {
  const formatMessage = useTranslate();
  return (
    <table className={styles['customTable']} border={1} cellSpacing="1">
      <thead>
        <tr>
          <td style={{ width: '30%' }}>{formatMessage('uns.serverDetail')}</td>
          <td>{formatMessage('uns.content')}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{formatMessage('common.serverName')}</td>
          <td>{instanceInfo.protocol?.serverName}</td>
        </tr>
        <tr>
          <td>{formatMessage('common.host')}</td>
          <td>{instanceInfo.protocol?.server?.host}</td>
        </tr>
        {instanceInfo.protocol?.server?.port !== 'opcda' && (
          <tr>
            <td>{formatMessage('common.port')}</td>
            <td>{instanceInfo.protocol?.server?.port}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
const NodeRedTable: FC<any> = ({ flowList }) => {
  const formatMessage = useTranslate();
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', display: 'contents' }}>
      {flowList &&
        flowList?.map((item: any, index: number) => {
          return (
            <div key={index} style={{ width: '100%' }}>
              <div style={{ width: '100%' }} className={styles['name']}>
                {item?.flowName}
              </div>
              <table className={styles['customTable']} border={1} cellSpacing="1">
                <thead>
                  <tr>
                    <td style={{ width: '30%' }}>{formatMessage('uns.collectionFlowDetail')}</td>
                    <td>{formatMessage('uns.content')}</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formatMessage('uns.CollectionFlowName')}</td>
                    <td>{item?.flowName}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage('uns.flowTemplate')}</td>
                    <td>{item?.template}</td>
                  </tr>
                  <tr>
                    <td>{formatMessage('uns.description')}</td>
                    <td>{item?.Description}</td>
                  </tr>
                </tbody>
              </table>
              <div className={styles['btn']}>
                <Button
                  color="default"
                  variant="filled"
                  style={{ marginTop: '10px', width: '100px' }}
                  icon={<Launch />}
                  iconPosition="end"
                  onClick={() => {
                    navigate(
                      `/flow-editor?${getSearchParamsString({ id: item.id, name: item.flowName, status: item.flowStatus, flowId: item.flowId })}`
                    );
                  }}
                >
                  Node-RED
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  );
};
const TdEngine1: FC<any> = ({ payload, dt = {}, instanceInfo }) => {
  const formatMessage = useTranslate();
  const navigate = useNavigate();
  return (
    <>
      <table className={styles['customTable']} border={1} cellSpacing="1">
        <thead>
          <tr>
            <td style={{ width: '30%' }}>{formatMessage('uns.keyName')}</td>
            <td style={{ width: '30%' }}>{formatMessage('uns.value')}</td>
            <td>{formatMessage('common.latestUpdate')}</td>
          </tr>
        </thead>
        {payload && (
          <tbody>
            {Object.keys(payload || {}).map((key) => (
              <tr key={key}>
                <td className="payloadFirstTd">{key}</td>
                <td>{simpleFormat(payload[key])}</td>
                <td>{formatTimestamp(dt[key])}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {instanceInfo?.dataType === 2 && instanceInfo?.alias && (
        <div className={styles['btn']}>
          <Button
            color="default"
            variant="filled"
            style={{ marginTop: '10px', width: '100px' }}
            icon={<Launch />}
            iconPosition="end"
            onClick={() => {
              getSourceList().then((data: any) => {
                const sourceData = data?.data?.data?.find((i: any) => i.alias === '@postgresql');
                const loadData = (params: any) => {
                  getRefreshList(params).then((res: any) => {
                    if (res.hasNextPage) {
                      loadData({
                        dataSourceId: sourceData?.id,
                        pageNo: res.data?.pageNo + 1,
                      });
                    } else {
                      navigate(
                        `/SQLEditor?dataSourceName=@postgresql&databaseName=postgres&databaseType=POSTGRESQL&schemaName=public&tableName=${instanceInfo?.alias}`
                      );
                    }
                  });
                };
                loadData({ dataSourceId: sourceData?.id });
              });
            }}
          >
            {formatMessage('uns.sqlEditor')}
          </Button>
        </div>
      )}
    </>
  );
};
const Mqtt1: FC<any> = () => {
  const formatMessage = useTranslate();
  return (
    <table className={styles['customTable']} border={1} cellSpacing="1">
      <thead>
        <tr>
          <td style={{ width: '30%' }}>{formatMessage('common.detail')}</td>
          <td>{formatMessage('uns.content')}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="payloadFirstTd">{formatMessage('uns.front')}</td>
          <td>{`wss://${window.location.hostname}:8084/mqtt`}</td>
        </tr>
        <tr>
          <td className="payloadFirstTd">{formatMessage('uns.backend')}</td>
          <td>{`tcp://${window.location.hostname}:1883/mqtt`}</td>
        </tr>
      </tbody>
    </table>
  );
};

const Tables: FC<any> = ({ instanceInfo }) => {
  const formatMessage = useTranslate();
  const newd: any = [];
  const newd2: any = [];
  // 用 Set 来存储已经处理过的组合（topic + field）
  const seen = new Set();
  // 去重
  const uniqueArr = instanceInfo.refers.filter((item: any) => {
    const key = `${item.topic}-${item.field}`; // 创建唯一的 key
    if (seen.has(key)) {
      return false; // 如果 key 已经存在，跳过该项
    } else {
      seen.add(key); // 否则加入 seen 集合
      return true; // 保留该项
    }
  });
  uniqueArr?.forEach((item: any, index: number) => {
    newd.push({
      label: 'Variable' + (index + 1),
      value: `"${item.topic}".${item.field}`,
    });
    newd2.push({
      label: 'Variable' + (index + 1),
      value: `${'Variable' + (index + 1)}`,
    });
  });

  // 用来存储最终的替换结果
  let resultStr = instanceInfo.expression;

  // 遍历 newd 数组，并替换对应的值
  newd.forEach((item: any) => {
    const valueRegex = new RegExp(item.value, 'g');
    resultStr = resultStr.replace(valueRegex, `${item.label}`);
  });

  return (
    <div className={styles['Tables']}>
      <ComFormula fieldList={newd2} defaultOpenCalculator={false} value={resultStr} readonly={true} />
      <table className={styles['customTable']} border={1} cellSpacing="1">
        <thead>
          <tr>
            <td style={{ width: '30%' }}>{formatMessage('uns.variable')}</td>
            <td>{formatMessage('uns.topic')}</td>
            <td>{formatMessage('uns.key')}</td>
          </tr>
        </thead>
        <tbody>
          {uniqueArr.map((item: any, index: number) => {
            return (
              <tr key={index}>
                <td>{formatMessage('uns.variable') + (index + 1)}</td>
                <td>{item?.topic}</td>
                <td>{item?.field}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ButtonError: FC<any> = () => {
  // nodeStatu
  return (
    // <Tooltip title={nodeStatu?.eventMessage}>
    <div className={styles['buttonError']}>
      <img src={c2} alt="cw" />
    </div>
    // </Tooltip>
  );
};
register({
  shape: 'modbus1',
  width: 150,
  height: 40,
  component: Modbus,
});
register({
  shape: 'nodeRed1',
  width: 150,
  height: 40,
  component: NodeRed,
});
register({
  shape: 'mqtt1',
  width: 150,
  height: 40,
  component: Mqtt,
});
register({
  shape: 'tdEngine1',
  width: 150,
  height: 40,
  component: TDEngine,
});
register({
  shape: 'apps1',
  width: 150,
  height: 40,
  component: Apps,
});

const commonLine = {
  sourceMarker: { name: 'circle', r: 2 },
  targetMarker: { name: 'circle', r: 2 },
  stroke: 'var(--supos-theme-color)',
  strokeDasharray: 3,
  style: {
    animation: 'ant-line 60s infinite linear',
  },
};
const markupLine = {
  markup: Markup.getForeignObjectMarkup(),
  attrs: {
    fo: {
      width: 16,
      height: 16,
      x: -10,
      y: -8,
    },
  },
};

const data = {
  nodes: [
    {
      id: 'modbus1',
      shape: 'modbus1',
      x: 0,
      y: 0,
      data: {
        name: '',
        protocol: {},
        active: false,
      },
    },
    {
      id: 'nodeRed1',
      shape: 'nodeRed1',
      x: 210,
      y: 0,
      data: {
        topic: '',
        active: false,
      },
    },
    {
      id: 'mqtt1',
      shape: 'mqtt1',
      x: 420,
      y: 0,
      data: {
        active: false,
      },
    },
    {
      id: 'tdEngine1',
      shape: 'tdEngine1',
      x: 630,
      y: 0,
      data: {
        dataType: 1,
        active: false,
      },
    },
    {
      id: 'apps1',
      shape: 'apps1',
      x: 840,
      y: 0,
      data: {
        active: false,
      },
    },
  ],
  edges: [
    {
      shape: 'edge',
      source: 'modbus1',
      target: 'nodeRed1',
      id: 'pushOriginalData',
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
      label: {
        position: 0,
      },
    },
    {
      shape: 'edge',
      source: 'nodeRed1',
      target: 'mqtt1',
      id: 'pushMqtt',
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
      label: {
        position: 0,
      },
    },
    {
      shape: 'edge',
      source: 'mqtt1',
      target: 'tdEngine1',
      id: 'pullMqttOrDataPersistence', //pullMqtt从mqtt拉数据或dataPersistence数据持久化
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
      label: {
        position: 0,
      },
    },
    {
      shape: 'edge',
      source: 'tdEngine1',
      target: 'apps1',
      id: 'apps12',
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
    },
  ],
};

// 临时处理，后续这块要重构
const data1 = {
  nodes: [
    {
      id: 'modbus1',
      shape: 'modbus1',
      x: 0,
      y: 0,
      data: {
        name: '',
        protocol: {},
        active: false,
      },
    },
    {
      id: 'mqtt1',
      shape: 'mqtt1',
      x: 210,
      y: 0,
      data: {
        active: false,
      },
    },
    {
      id: 'tdEngine1',
      shape: 'tdEngine1',
      x: 420,
      y: 0,
      data: {
        dataType: 1,
        active: false,
      },
    },
    {
      id: 'apps1',
      shape: 'apps1',
      x: 630,
      y: 0,
      data: {
        active: false,
      },
    },
  ],
  edges: [
    {
      shape: 'edge',
      source: 'modbus1',
      target: 'mqtt1',
      id: 'pushOriginalData',
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
      label: {
        position: 0,
      },
    },
    {
      shape: 'edge',
      source: 'mqtt1',
      target: 'tdEngine1',
      id: 'pullMqttOrDataPersistence', //pullMqtt从mqtt拉数据或dataPersistence数据持久化
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
      label: {
        position: 0,
      },
    },
    {
      shape: 'edge',
      source: 'tdEngine1',
      target: 'apps1',
      id: 'apps12',
      attrs: {
        // line 是选择器名称，选中的边的 path 元素
        line: { ...commonLine },
      },
    },
  ],
};
const TopologyChart = ({ instanceInfo, payload, dt }: any) => {
  const graphRef = useRef<any>(null);
  const { dashboardType } = useRoutesContext();
  const [active, setActive] = useState<any>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [datas, setDatas] = useState<any>([]);
  const modeState = useRef<any>([]);
  const interls = useRef<any>(null);
  const orderList = ['pushOriginalData', 'pushMqtt', 'pullMqttOrDataPersistence']; //自定义循序
  const [activeInfo, setActiveInfo] = useState<any>();
  const [errorState, setErrorState] = useState<any>(false);
  const navigate = useNavigate();
  function findDate({ dataType, withSave2db, withFlow }: any) {
    const _data = !withFlow ? data1 : data;
    _data.nodes[3].data.dataType = dataType;
    if (dataType == 3) {
      return Object.assign({}, _data, {
        nodes: _data.nodes.slice(2),
        edges: _data.edges.slice(2),
      });
    }
    if (!withFlow) {
      // return Object.assign({}, data, {
      //   nodes: data.nodes.splice(1, 1),
      //   edges: data.edges.splice(1, 1),
      // });
    }
    if (!withSave2db) {
      return Object.assign({}, _data, {
        nodes: _data.nodes.slice(0, -2),
        edges: _data.edges.slice(0, -2),
      });
    }
    return _data;
  }
  // 更新状态
  const updateNodeState = (edgeId: string, status = false, marked = true) => {
    if (!graphRef.current) return;
    const edge = graphRef.current.getCellById(edgeId);
    if (status) {
      edge?.attr('line/stroke', 'red'); // 更新边的颜色
      edge?.attr('line/style/animation', ''); // 清除动画
      edge?.setLabels(markupLine); //追加label
    } else {
      edge?.attr('line/stroke', 'var(--supos-theme-color)'); // 更新边的颜色
      edge?.attr('line/style/animation', 'ant-line 60s infinite linear'); // 清除动画
      edge?.setLabels({}); //追加label
    }
    // 是否去除叉叉
    if (!marked) {
      edge?.setLabels({}); //追加label
    }
  };
  const xxIndexMap = orderList.reduce((acc: any, cur: any, index: number) => {
    acc[cur] = index;
    return acc;
  }, {});
  const compareByXxOrder = (a: any, b: any) => {
    const indexA = xxIndexMap[a.topologyNode];
    const indexB = xxIndexMap[b.topologyNode];
    return indexA - indexB;
  };
  // 轮询获取拓扑图状态
  const getTopologyState = async () => {
    getTopologyStatus({
      topic: instanceInfo?.topic || '',
    }).then((res: any) => {
      const flag = res.filter((item: any) => item.eventCode != '0');
      if (flag.length > 0) {
        setErrorState(true);
      } else {
        setErrorState(false);
      }

      const sortedData = res.sort(compareByXxOrder);
      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].eventCode !== '0') {
          for (let j = i + 1; j < sortedData.length; j++) {
            sortedData[j].marked = true;
          }
          break; // 找到第一个eventCode不等于0的元素并处理后就可以退出循环了
        }
      }

      //合并pullMqtt和dataPersistence的报错信息
      const errNode = sortedData.find((e: any) => e.eventCode !== '0');
      if (errNode && ['pullMqtt', 'dataPersistence'].includes(errNode.topologyNode)) {
        sortedData.push({ ...errNode, topologyNode: 'pullMqttOrDataPersistence' });
      } else {
        sortedData.push({
          topologyNode: 'pullMqttOrDataPersistence',
          eventCode: '0',
          eventMessage: null,
          eventTime: null,
          marked: errNode ? true : false,
        });
      }
      sortedData.push({
        topologyNode: 'apps12',
        eventCode: '0',
        eventMessage: null,
        eventTime: null,
        marked: errNode ? true : false,
      });

      modeState.current = sortedData;
      data.edges.map((item: any) => {
        sortedData.map((item2: any) => {
          if (item.id === item2.topologyNode && item2.eventCode != '0' && !item2.marked) {
            updateNodeState(item.id, true, true);
            clearInterval(interls.current);
          } else if (item.id === item2.topologyNode && item2.eventCode == '0' && item2.marked) {
            updateNodeState(item.id, true, false);
          } else if (item.id === item2.topologyNode && item2.eventCode == '0' && !item2.marked) {
            updateNodeState(item.id, false, true);
          }
        });
      });
      return sortedData;
    });
  };

  const handleResize = debounce(() => {
    if (graphRef.current) {
      const ww = document.getElementsByClassName('treemapTitle')[0].clientWidth;
      const width = window.innerWidth - ww - 50; // 宽度减去侧边栏宽度
      const height = 200; // 计算容器高度
      graphRef.current.resize(width, height);
    }
  }, 200); // 防抖 200 毫秒
  // 为节点绑定点击事件
  const nodeClickFn = ({ cell }: any) => {
    if (cell?.id === 'apps1' && dashboardType?.includes('grafana')) {
      navigate('/grafana-design', { state: { url: getAppsLink(instanceInfo), name: 'GrafanaDesign' } });
      return;
    }
    setActive((active: any) => (active === cell.id ? '' : cell.id));
    const node = graphRef.current.getCellById(cell.id);
    if (node.data.active) {
      // 清空所有节点的选中状态
      graphRef.current.getNodes().forEach((node: any) => {
        node.setData({
          active: false,
        });
      });
    } else {
      // 清空所有节点的选中状态
      graphRef.current.getNodes().forEach((node: any) => {
        node.setData({
          active: false,
        });
      });
      // 给节点添加选中样式
      node.setData({
        active: true,
      });
    }
  };

  // 为边绑定点击事件
  const edgeClickFn = ({ cell }: any) => {
    setActive((active: any) => (active === cell.id ? '' : cell.id));
    clearInterval(interls.current);
    // getTopologyState();
    const xx = modeState.current?.filter((item: any) => item.topologyNode == cell.id && item.eventCode != 0) || [];
    setActiveInfo(xx[0]);
    modeState.current = [];
    // interls.current = setInterval(() => {
    //   getTopologyState();
    // }, 2000);
  };

  // 更新 Topology 数据
  const fetchTopologyData = async (topic: any) => {
    try {
      const result = await goFlow(topic);
      setDatas(result);
    } catch (error) {
      console.error('Error fetching topology data:', error);
    }
  };

  const getAppsLink = (data: any) => {
    const { alias } = data || {};
    const aliasHash = md5(instanceInfo?.alias).slice(8, 24);
    return `/grafana/home/d/${aliasHash}/${alias.replaceAll('_', '-')}`;
  };

  // 获取并更新图表数据
  const updateGraphData = (instanceInfo: any) => {
    const { nodes, edges } = findDate(instanceInfo) || { nodes: [], edges: [] };
    modeState.current = [];
    if (graphRef.current) {
      // 清理现有的节点和边
      nodes.forEach((node) => graphRef.current.addNode(node));
      edges.forEach((edge) => graphRef.current.addEdge(edge));
      const graphNode = graphRef.current.getCellById('modbus1');
      if (graphNode) {
        graphNode.setData({
          protocol: instanceInfo.protocol,
        });
      }
    }
  };

  // 初始化图表
  const initGraph = () => {
    if (!containerRef.current) return;
    const graphInstance: any = new Graph({
      container: containerRef.current,
      background: { color: 'var(--supos-gray-color-10-message)' },
      interacting: false,
      panning: true,
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'] },
      scaling: { min: 0.05, max: 12 },
    });

    graphInstance.options.onEdgeLabelRendered = (args: any) => {
      const { selectors, edge } = args; // 获取edge对象
      const content = selectors.foContent as HTMLDivElement;
      if (content) {
        const root = ReactDOM.createRoot(content);
        const nodeStatu = modeState.current?.find((item: any) => item.topologyNode === edge.id);
        root.render(<ButtonError nodeStatu={nodeStatu} />); // 渲染组件
      }
    };
    graphRef.current = graphInstance;
    graphInstance.positionPoint({ x: 0, y: 0 }, 40, '40%');
    return graphInstance;
  };

  // 获取拓扑状态
  const getTopologyStateData = async () => {
    try {
      await getTopologyState();
    } catch (error) {
      console.error('Error fetching topology state:', error);
    }
  };

  useEffect(() => {
    initGraph();
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (graphRef.current) {
        graphRef.current?.clearCells();
        graphRef.current = null;
      }
    };
  }, []);

  useDeepCompareEffect(() => {
    graphRef.current?.clearCells();
    setActive('');
    fetchTopologyData(instanceInfo?.topic);
    if (!graphRef.current || !instanceInfo) return;
    // 设置轮询
    interls.current = setInterval(() => {
      getTopologyStateData();
    }, 2000);
    // 更新图表数据
    updateGraphData(instanceInfo);
    // 设置事件监听器
    graphRef.current.on('node:click', nodeClickFn);
    graphRef.current.on('edge:click', edgeClickFn);

    // 清理事件监听器
    return () => {
      if (graphRef.current) {
        graphRef.current.off('node:click', nodeClickFn);
        graphRef.current.off('edge:click', edgeClickFn);
      }
      clearInterval(interls.current);
      interls.current = null;
    };
  }, [instanceInfo]);
  return (
    <div className={styles['detailTopologyWrap']}>
      <div className={styles['detailTopologyContent']} ref={containerRef} />
      {(['modbus1', 'tdEngine1', 'mqtt1'].includes(active) || (active === 'nodeRed1' && datas?.length > 0)) && (
        <div className={styles['detailTable']}>
          {active === 'mqtt1' && instanceInfo.dataType == 3 && <Tables instanceInfo={instanceInfo} />}
          {active == 'modbus1' ? <Modbus1 instanceInfo={instanceInfo} /> : ''}
          {active == 'nodeRed1' ? <NodeRedTable flowList={datas} /> : ''}
          {active == 'tdEngine1' ? <TdEngine1 payload={payload} instanceInfo={instanceInfo} dt={dt} /> : ''}
          {active == 'mqtt1' && instanceInfo.dataType != 3 ? <Mqtt1 /> : ''}
        </div>
      )}

      {errorState &&
        activeInfo?.eventMessage &&
        ['pushOriginalData', 'pushMqtt', 'pullMqttOrDataPersistence'].includes(active) && (
          <div className={styles['detailTable']} style={{ alignItems: 'center' }}>
            <div className={styles['error']}>
              <img src={error} />
              {/* <span>Your connection encountered an issue during the modeling phase.</span> */}
              <span>{activeInfo?.eventMessage}</span>
            </div>
          </div>
        )}
    </div>
  );
};
export default TopologyChart;
