import { FC, useState, useEffect } from 'react';
import { App, TreeSelect, TreeSelectProps } from 'antd';
import { Db2Database, ContainerServices, Folder, TableSplit } from '@carbon/icons-react';
import { getDatabaseList, getSchemaList, getTableList } from '@/apis/chat2db';
import './index.scss';

const TableSelect: FC<any> = ({ dataSource, sourceList, formatMessage, ...restProps }) => {
  const { message } = App.useApp();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [treeLoadedKeys, setTreeLoadedKeys] = useState<any[]>([]);
  const source = sourceList.find((item: any) => item.id === dataSource) || {};

  useEffect(() => {
    if (!dataSource) return;
    getDatabaseList({ dataSourceId: dataSource, dataSourceName: source.alias, refresh: true }).then((res: any) => {
      if (res.success) {
        setTreeData(
          res?.data?.map((item: any) => {
            return {
              ...item,
              id: item.name,
              pId: 0,
              value: item.name,
              title: item.name,
              level: 1,
              selectable: false,
              icon: <Db2Database />,
            };
          }) || []
        );
      }
    });
    setTreeLoadedKeys([]);
  }, [dataSource]);

  const refactoringData = (data: any[], pId: string, level: number, isLeaf?: boolean) => {
    return data
      .filter((e: any) => e.pId !== pId)
      .map((item: any) => {
        return {
          ...item,
          id: `${pId}$分隔符$${item.name}`,
          pId,
          value: `${pId}$分隔符$${item.name}`,
          title: item.name,
          level: level,
          isLeaf: isLeaf,
          selectable: isLeaf || false,
          icon: level === 2 ? <ContainerServices /> : <TableSplit />,
        };
      });
  };

  const handleTableList = async (params: any, id: string, level: number) => {
    const { data, success }: any = await getTableList(params);
    if (success) {
      setTreeData(treeData.concat(refactoringData(data || [], id, level, true)));
      if (!data?.length) {
        const newTreeLoadedKeys = [...treeLoadedKeys];
        const index = treeLoadedKeys.findIndex((item: any) => item === id);
        if (index > -1) newTreeLoadedKeys.splice(index, 1);
        setTreeLoadedKeys(newTreeLoadedKeys);
        message.warning(formatMessage('uns.noTablesTip'));
      }
    }
  };

  const handleTables = (id: string, level: number) => {
    return [
      {
        id: `${id}$分隔符$tables`,
        pId: id,
        title: 'tables',
        value: `${id}$分隔符$tables`,
        level,
        selectable: false,
        icon: <Folder />,
      },
    ];
  };

  const getParentId = (pId: string) => {
    const parent = treeData.find((item: any) => item.id === pId);
    if (parent.id.includes('tables')) {
      getParentId(parent.pId);
    } else {
      return parent.pId;
    }
  };

  const onLoadData: TreeSelectProps['loadData'] = (node) =>
    new Promise((resolve) => {
      const { id, pId, level } = node;
      switch (level) {
        case 1:
          getSchemaList({
            dataSourceId: dataSource,
            dataSourceName: source.alias,
            databaseType: source.type,
            databaseName: id,
            refresh: true,
            pageNo: 1,
          }).then(({ success, data }: any) => {
            if (success) {
              const treeNodeData = data?.length
                ? refactoringData(
                    data.filter((e: any) => !['information_schema', 'pg_catalog'].includes(e.name?.toLowerCase())),
                    id,
                    2
                  )
                : handleTables(id, 2);
              setTreeData(treeData.concat(treeNodeData));
            }
          });
          break;
        case 2:
          if (id.includes('tables')) {
            handleTableList(
              {
                dataSourceId: dataSource,
                databaseName: treeData
                  .find((item: any) => item.id === pId)
                  ?.id?.split('$分隔符$')
                  .slice(-1)[0],
              },
              id,
              3
            );
          } else {
            setTreeData(treeData.concat(handleTables(id, 3)));
          }
          break;
        case 3:
          handleTableList(
            {
              dataSourceId: dataSource,
              databaseName: getParentId(pId),
              schemaName: treeData
                .find((item: any) => item.id === pId)
                ?.id.split('$分隔符$')
                .slice(-1)[0],
            },
            id,
            4
          );
          break;
        default:
          break;
      }
      resolve(undefined);
    });

  return (
    <TreeSelect
      {...restProps}
      treeDataSimpleMode
      treeData={treeData}
      loadData={onLoadData}
      treeLoadedKeys={treeLoadedKeys}
      treeExpandedKeys={treeLoadedKeys}
      onTreeExpand={(expandedKeys) => {
        setTreeLoadedKeys(expandedKeys);
      }}
      showSearch
      labelInValue
      treeIcon
      popupClassName="table-select-popup"
    />
  );
};

export default TableSelect;
