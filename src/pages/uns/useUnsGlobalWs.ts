import { useWebSocket } from 'ahooks';
import { useState } from 'react';

export type IcmpStatesType = { topic: string; status: 0 | 1 }[];
interface WsResponseDataProps {
  icmpStates?: IcmpStatesType;
  [key: string]: any;
}

const useUnsGlobalWs = () => {
  const [data, setData] = useState<WsResponseDataProps>({});

  useWebSocket(
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/inter-api/supos/uns/ws?globalTopology=true`,
    {
      reconnectLimit: 0,
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        setData(data);
      },
      onError: (error) => console.error('WebSocket error:', error),
    }
  );
  const { icmpStates, ...topologyData } = data;
  return {
    topologyData,
    icmpStates: icmpStates || [],
  };
};

export default useUnsGlobalWs;
