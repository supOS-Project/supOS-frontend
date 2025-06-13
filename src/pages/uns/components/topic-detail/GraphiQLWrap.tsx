import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import 'graphiql/graphiql.css'; // 引入样式
import '@graphiql/plugin-explorer/dist/style.css';
import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/stores/theme-store.ts';

const GraphiQLWrap = ({ alias }: any) => {
  const theme = useThemeStore((state) => state.theme);
  const timer: any = useRef(null);
  // 创建fetcher
  const fetcher = createGraphiQLFetcher({
    url: '/hasura/home/v1/graphql',
  });
  const explorer = explorerPlugin({
    explorerIsOpen: true,
    styles: {
      buttonStyle: {
        cursor: 'pointer',
        fontSize: '1em',
        lineHeight: 0,
        border: '1px solid #c6c6c6',
        borderRadius: '3px',
      },
      explorerActionsStyle: {
        paddingTop: 'var(--px-16)',
      },
      actionButtonStyle: {
        height: '22px',
        width: '22px',
        cursor: 'pointer',
        fontSize: '1em',
        lineHeight: 0,
        border: '1px solid #c6c6c6',
        borderRadius: '3px',
        padding: 0,
      },
    },
  });
  useEffect(() => {
    if (alias)
      timer.current = setInterval(() => {
        const graphiqlPlugin = document.querySelector('.graphiql-plugin');
        const schemaNode = document.querySelector(`[data-field-name="${alias}"]`);
        if (graphiqlPlugin && schemaNode) {
          // 获取 schemaNode 的位置信息
          const schemaRect = schemaNode.getBoundingClientRect();
          const pluginRect = graphiqlPlugin.getBoundingClientRect();

          // 计算 schemaNode 相对于 graphiqlPlugin 的位置
          const offsetTop = schemaRect.top - pluginRect.top;

          // 滚动 graphiqlPlugin 使得 schemaNode 可见
          graphiqlPlugin.scrollTop = graphiqlPlugin.scrollTop + offsetTop;
          clearInterval(timer.current);
        }
      }, 50);
    return () => {
      clearInterval(timer.current);
    };
  }, [alias]);

  return (
    <div style={{ height: '500px', display: 'flex' }}>
      <GraphiQL
        fetcher={fetcher}
        plugins={[explorer]}
        visiblePlugin={explorer}
        disableTabs
        showPersistHeadersSettings={false}
        forcedTheme={(theme as any) || 'light'}
        query={`query MyQuery {
  ${alias} {
    _ct
    _id
  }
}`}
      />
    </div>
  );
};

export default GraphiQLWrap;
