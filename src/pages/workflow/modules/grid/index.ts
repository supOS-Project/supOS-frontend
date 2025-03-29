import GridLineModule from 'diagram-js-grid-bg';

export default {
  additionalModules: [GridLineModule],
  gridLine: {
    smallGridSpacing: 10, // 最小网格边长
    gridSpacing: 100, // 大号网格边长
    gridLineStroke: 0.5, // 网格边框宽度
    gridLineOpacity: 0.4, // 网格边框透明度
    gridLineColor: '#ccc', // 网格边框颜色
  },
};
