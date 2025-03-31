import { FC, useState } from 'react';
import { Tabs, Flex, TabsProps } from 'antd';
import { useTranslate } from '@/hooks';
import { ComCopyContent, ComCodeSnippet } from '@/components';
import styles from './UploadData.module.scss';
import { useRoutesContext } from '@/contexts/routes-context';
import { observer } from 'mobx-react-lite';
import StickyBox from 'react-sticky-box';
import { getExampleForJavaType } from '@/utils';
import { fromPairs, map } from 'lodash';

const UploadData: FC<any> = ({ instanceInfo }) => {
  const formatMessage = useTranslate();
  const [tab, setTab] = useState('js');
  const routesStore = useRoutesContext();
  const wsPort = routesStore?.systemInfo?.mqttWebsocketTslPort ?? window.location.port;
  const tcpPort = routesStore?.systemInfo?.mqttTcpPort ?? window.location.port;
  const hostName = window.location.hostname;
  const [height, setHeight] = useState<any>();
  const fieldExampleList = instanceInfo?.fields?.map((item: any) => {
    return {
      key: item.name,
      value: getExampleForJavaType(item.type, item.name),
      type: item.type,
    };
  });
  const jsObj = fromPairs(map(fieldExampleList, (item) => [item.key, item.value]));
  const jscode = `
  const mqtt = require('mqtt');

  const options = {
    clean: true, 
    connectTimeout: 4000, 
    clientId: 'emqx_test',
    rejectUnauthorized: false,
  };

  const connectUrl ='wss://${hostName}:${wsPort}/mqtt';

  const client = mqtt.connect(connectUrl, options);

  client.on('connect', function () {
    console.log('Connected');
    client.subscribe('${instanceInfo.topic}', function (err) {
      console.log(err)
      if (!err) {
        client.publish('${instanceInfo.topic}', JSON.stringify(${JSON.stringify(jsObj)}));
      }
    });
  });
  
  client.on('message', function (topic, message) {
    console.log(topic, message.toString());
  });
  
`;
  const javacode = `
   import com.alibaba.fastjson.JSONObject;
   import org.eclipse.paho.client.mqttv3.*; 
   
   public class MqttDemo {

    public static void main(String[] args) {
        //${formatMessage('uns.mqttServer')}
        String broker = "tcp://${hostName}:${tcpPort}";
        //${formatMessage('uns.mqttClientId')}
        String clientId = "JavaDemoClient1";
        //${formatMessage('uns.mqttTopicPosted')}
        String topic = "${instanceInfo.topic}";
        //${formatMessage('uns.mqttQos')}
        int qos = 1;
        //${formatMessage('uns.mqttMessage')}
        JSONObject root = new JSONObject();
        JSONObject source = new JSONObject();
        root.put("_source_", source);
        JSONObject resource = new JSONObject();
${fieldExampleList?.map((item: any) => `        resource.put("${item.key}", ${item.type === 'string' ? '"' + item.value + '"' : item.type === 'datetime' ? item.value + 'L' : item.value});`).join('\n')}
        String content = resource.toString();
        root.put("_resource_", resource);
        
        try {
            //${formatMessage('uns.mqttCreateClient')}
            MqttAsyncClient client = new MqttAsyncClient(broker, clientId);
            //${formatMessage('uns.mqttSetOptions')}
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setConnectionTimeout(10);
            options.setAutomaticReconnect(true);

            //${formatMessage('uns.mqttConnect')}
            client.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    System.out.println("Connection to MQTT broker lost!");
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) throws Exception {
                    System.out.printf("Message arrived. Topic: %s Message: %s%n", topic, new String(message.getPayload()));
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                    System.out.println("Delivery is complete!");
                }
            });
            
            //${formatMessage('uns.ConnectToMQTTServer')}
            System.out.println("Connecting to broker: " + broker);
            IMqttToken token = client.connect(options);
            token.waitForCompletion();
            if (token.isComplete() && token.getException() == null) {
                System.out.println("Connected with result code " + token.getResponse().toString());
            }

            //${formatMessage('uns.mqttPublish')}
            for (int i = 0; i< 20; i++) {
                MqttMessage message = new MqttMessage(content.getBytes());
                message.setQos(qos);
                System.out.println("Publishing message: " + content);
                client.publish(topic, message);
                Thread.sleep(1000);
            }


            //${formatMessage('uns.mqttDisconnect')}
            Thread.sleep(10000);
            client.disconnect();
            client.close();
        } catch (MqttException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
`;

  const jb = `
    <dependency>
      <groupId>org.eclipse.paho</groupId>
      <artifactId>org.eclipse.paho.client.mqttv3</artifactId>
      <version>1.2.5</version>
    </dependency>
    <dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>fastjson</artifactId>
      <version>2.0.53</version>
    </dependency>`;

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox offsetTop={-12} offsetBottom={0} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );
  return (
    <div className={styles['upload-data']}>
      <div className={styles['upload-data-info']} style={{ height }}>
        <div className={styles['info-title']}>{formatMessage('uns.MQTTAccessPoint')}</div>
        <div className={styles['info-description']}>{formatMessage('uns.MQTTAccessMethod')}</div>
        <Tabs
          renderTabBar={renderTabBar}
          activeKey={tab}
          onChange={(t) => {
            setTab(t);
          }}
          items={[
            {
              label: 'JS',
              key: 'js',
              children: (
                <Flex gap={14} vertical>
                  <ComCopyContent label={formatMessage('uns.MQTTUrl')} textToCopy={`wss://${hostName}`} />
                  <ComCopyContent label={formatMessage('uns.MQTTPort')} textToCopy={wsPort} />
                  <ComCopyContent label={formatMessage('uns.topic')} textToCopy={instanceInfo?.topic} />
                  <ComCopyContent label={formatMessage('uns.dependent')} textToCopy={'npm install mqtt'} />
                </Flex>
              ),
            },
            {
              label: 'JAVA',
              key: 'java',
              children: (
                <Flex gap={14} vertical>
                  <ComCopyContent label={formatMessage('uns.MQTTUrl')} textToCopy={`tcp://${hostName}`} />
                  <ComCopyContent label={formatMessage('uns.MQTTPort')} textToCopy={tcpPort} />
                  <ComCopyContent label={formatMessage('uns.topic')} textToCopy={instanceInfo?.topic} />
                  <ComCopyContent label={formatMessage('uns.dependent')} textToCopy={jb} />
                </Flex>
              ),
            },
          ]}
        ></Tabs>
        {[1, 2, 3, 6].includes(instanceInfo.dataType) && (
          <>
            <div title={formatMessage('uns.payload')} className="payload">
              {formatMessage('uns.payload')}
            </div>
            <ComCodeSnippet
              style={{
                '--supos-switchwrap-active-bg-color': 'var(--supos-charttop-bg-color)',
              }}
              minCollapsedNumberOfRows={undefined}
              maxCollapsedNumberOfRows={undefined}
            >
              {JSON.stringify(jsObj, null, 2)}
            </ComCodeSnippet>
          </>
        )}
      </div>
      <div className={styles['upload-data-code']}>
        <ComCodeSnippet
          onSizeChange={(size) => {
            setHeight(size?.height);
          }}
        >
          {tab === 'js' ? jscode : javacode}
        </ComCodeSnippet>
      </div>
    </div>
  );
};

export default observer(UploadData);
