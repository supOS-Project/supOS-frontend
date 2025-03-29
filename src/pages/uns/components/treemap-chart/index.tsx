import { FC, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useThemeContext } from '@/contexts/theme-context';

const TreemapChart: FC<any> = (props) => {
  const { treeData, changeCurrentPath } = props;
  // 使用 useRef 来保存图表实例
  const chart: any = useRef(null);
  // 获取主题
  const themeStore = useThemeContext();

  // 使用 useRef 来引用 DOM 元素
  const chartDom = useRef(null);
  const isDark = themeStore.theme.includes('dark');
  const isChartreuse = themeStore.theme.includes('chartreuse');

  const commonLabelColor = isDark ? '#fff' : '#000';
  const getLevelOption = () => {
    return [
      {
        itemStyle: {
          borderWidth: 0,
          gapWidth: 2,
        },
        upperLabel: {
          show: false,
        },
      },
      {
        itemStyle: {
          borderColor: isDark ? '#161616' : '#fff',
          borderWidth: 20,
          gapWidth: 0,
        },
        emphasis: {
          disabled: true,
        },
        upperLabel: {
          color: commonLabelColor, // 字体颜色
          fontSize: 20, // 字体大小
          fontWeight: 'bold',
          height: 40,
        },
      },
      {
        itemStyle: {
          borderColor: isDark ? '#161616' : isChartreuse ? '#F0FDB2' : '#E8F1FF',
          borderWidth: 15,
          gapWidth: 2,
          shadowColor: isDark ? '#fff' : '#666',
          shadowBlur: 2,
        },
        upperLabel: {
          color: commonLabelColor, // 字体颜色
          fontSize: 20, // 字体大小
          height: 30,
          fontWeight: 'bold',
        },
      },
      {
        itemStyle: {
          borderColor: isChartreuse ? '#CCF368' : '#BBD6FF',
          borderWidth: 15,
          gapWidth: 2,
        },
        upperLabel: {
          color: commonLabelColor, // 字体颜色
          fontSize: 16, // 字体大小
          lineHeight: 16,
          height: 30,
          fontWeight: 'bold',
        },
      },
    ];
  };

  // 处理数据
  const removeBorderForLeaves = (data: any) => {
    data.forEach((node: any) => {
      if (!node.children) {
        // 如果是叶子节点
        node.itemStyle = {
          borderWidth: 0,
        };
      } else {
        // 递归处理子节点
        removeBorderForLeaves(node.children);
      }
    });
  };
  const initColor = {
    blue: {
      color: ['#8EBBFE'],
      itemStyle: {
        color: '#68a4fe',
        borderColor: '#68a4fe',
      },
    },
    chartreuse: {
      color: ['#94c618'],
      itemStyle: {
        color: '#779E13',
        borderColor: '#779E13',
      },
    },
  };
  const initTheme = () => {
    if (isChartreuse) {
      return initColor.chartreuse;
    }
    return initColor.blue;
  };
  useEffect(() => {
    const copyTreeData = treeData;
    removeBorderForLeaves(copyTreeData);
    // 初始化图表实例
    chart.current = echarts.init(chartDom.current, null, { renderer: 'svg' });

    // 配置图表选项
    const option = {
      containLabel: false,
      color: initTheme().color,
      tooltip: { show: false },
      series: [
        {
          squareRatio: 1,
          roam: false, //是否开启拖拽漫游（移动和缩放）
          name: '',
          type: 'treemap',
          visibleMin: 0, //最小显示大小
          leafDepth: 4, //需要展示的层级
          left: 0,
          top: 2,
          right: 0,
          bottom: 0,
          label: {
            show: true,
            formatter: '{b}',
            color: commonLabelColor,
            fontSize: 16,
            position: [8, 3],
            fontFamily: 'IBM Plex Sans',
          },
          upperLabel: {
            show: true,
            height: 30,
            fontFamily: 'IBM Plex Sans',
          },
          itemStyle: {
            borderRadius: 1,
            gapWidth: 0,
          },
          emphasis: {
            itemStyle: {
              color: initTheme().itemStyle.color,
              borderColor: initTheme().itemStyle.borderColor,
            },
          },
          levels: getLevelOption(),
          data: copyTreeData,
          breadcrumb: { show: false }, //隐藏面包屑
        },
      ],
    };

    // 设置配置项和数据
    chart.current.setOption(option);

    // 添加点击事件处理器
    chart.current.on('click', function (e: any) {
      if (e?.data?.path) {
        changeCurrentPath(e?.data || {});
      }
    });
    window.onresize = function () {
      if (chart.current) chart.current?.resize();
    };
    // 清理函数
    return () => {
      chart.current.dispose(); // 销毁图表实例
    };
  }, [treeData, themeStore.theme]); // 当依赖项为空数组时，useEffect 只会在组件挂载时执行一次

  useEffect(() => {
    const element = document.getElementsByClassName('treemapWrap')[0];

    // 创建一个ResizeObserver实例并传入一个回调函数
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => {
        if (chart.current) chart.current?.resize();
      });
      // }
    });

    // 开始观察元素
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  return <div className="treemapWrap" ref={chartDom} style={{ width: '100%', height: '100%' }} />;
};

export default TreemapChart;
