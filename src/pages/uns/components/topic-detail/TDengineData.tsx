import { observer } from 'mobx-react-lite';
import { useTranslate } from '@/hooks';
import { useState } from 'react';
import styles from './UploadData.module.scss';
import { Flex, Tabs, TabsProps } from 'antd';
import { ComCodeSnippet, ComCopyContent } from '@/components';
import StickyBox from 'react-sticky-box';

const TDengineData = () => {
  const formatMessage = useTranslate();
  const [tab, setTab] = useState('java');
  const [height, setHeight] = useState<any>();

  const java = `
  public static void main(String[] args) throws Exception {
      String jdbcUrl = "jdbc:TAOS-RS://localhost:6041?user=root&password=taosdata";
      try (Connection conn = DriverManager.getConnection(jdbcUrl)) {
          System.out.println("Connected to " + jdbcUrl + " successfully.");
  
          // you can use the connection for execute SQL here
  
      } catch (Exception ex) {
          // please refer to the JDBC specifications for detailed exceptions info
          System.out.printf("Failed to connect to %s, %sErrMessage: %s%n",
                  jdbcUrl,
                  ex instanceof SQLException ? "ErrCode: " + ((SQLException) ex).getErrorCode() + ", " : "",
                  ex.getMessage());
          // Print stack trace for context in examples. Use logging in production.
          ex.printStackTrace();
          throw ex;
      }
  }
`;

  const python = `
  import taosrest
  
  def create_connection():
      conn = None
      url="http://localhost:6041"
      try:
          conn = taosrest.connect(url=url,
                                  user="root",
                                  password="taosdata",
                                  timeout=30)
          
          print(f"Connected to {url} successfully.");
      except Exception as err:
          print(f"Failed to connect to {url} , ErrMessage:{err}")
      finally:
          if conn:
              conn.close() 
`;

  const go = `
  package main
  
  import (
      "database/sql"
      "fmt"
      "log"
      _ "github.com/taosdata/driver-go/v3/taosRestful"
  )
  
  func main() {
      // use
      // var taosDSN = "root:taosdata@http(localhost:6041)/dbName"
      // if you want to connect a specified database named "dbName".
      var taosDSN = "root:taosdata@http(localhost:6041)/"
      taos, err := sql.Open("taosRestful", taosDSN)
      if err != nil {
        log.Fatalln("Failed to connect to " + taosDSN + "; ErrMessage: " + err.Error())
      }
      fmt.Println("Connected to " + taosDSN + " successfully.")
      defer taos.Close()
  }
`;

  const selectTabObj: any = {
    java,
    go,
    python,
  };

  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox offsetTop={-12} offsetBottom={0} style={{ zIndex: 1 }}>
      <DefaultTabBar {...props} />
    </StickyBox>
  );

  return (
    <div className={styles['upload-data']}>
      <div className={styles['upload-data-info']} style={{ height }}>
        <div className={styles['info-title']}>{formatMessage('tdengine.restConnect')}</div>
        <div className={styles['info-description']}>{formatMessage('tdengine.descript')}</div>
        <Tabs
          renderTabBar={renderTabBar}
          activeKey={tab}
          onChange={(t) => {
            setTab(t);
          }}
          items={[
            {
              label: 'JAVA',
              key: 'java',
              children: (
                <Flex gap={14} vertical>
                  <ComCopyContent label={formatMessage('common.url')} textToCopy={`jdbc:TAOS-RS://localhost`} />
                  <ComCopyContent label={formatMessage('common.port')} textToCopy={'6041'} />
                </Flex>
              ),
            },
            {
              label: 'Python',
              key: 'python',
              children: (
                <Flex gap={14} vertical>
                  <ComCopyContent label={formatMessage('common.url')} textToCopy={`http://localhost`} />
                  <ComCopyContent label={formatMessage('common.port')} textToCopy={'6041'} />
                </Flex>
              ),
            },
            {
              label: 'Go',
              key: 'go',
              children: (
                <Flex gap={14} vertical>
                  <ComCopyContent label={'taosDSN'} textToCopy={`root:taosdata@http(localhost:6041)/`} />
                  <ComCopyContent label={formatMessage('common.port')} textToCopy={'6041'} />
                </Flex>
              ),
            },
          ]}
        ></Tabs>
      </div>
      <div className={styles['upload-data-code']}>
        <ComCodeSnippet
          onSizeChange={(size) => {
            setHeight(size?.height);
          }}
        >
          {selectTabObj[tab] ?? ''}
        </ComCodeSnippet>
      </div>
    </div>
  );
};

export default observer(TDengineData);
