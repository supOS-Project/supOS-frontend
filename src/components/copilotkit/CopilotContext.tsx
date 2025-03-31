import { useCopilotAction, useCopilotReadable, CopilotTask, useCopilotContext } from '@copilotkit/react-core';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import { observer } from 'mobx-react-lite';
import { Button, Space } from 'antd';
import { useMenuNavigate } from '@/hooks';
import { InlineLoading } from '@/components';
import { useAiContext } from '@/contexts/ai-context.ts';
import {
  createAppDescriptions,
  unsRelationalOperationDescriptions,
  unsTimeSeriesOperationDescriptions,
} from '../copilotkit/descriptions.ts';
import { getTimeSeriesStep, getUnsRelationalStep } from '../copilotkit/step.ts';
import { useCopilotChatSuggestions } from '@copilotkit/react-ui';
import CommonTextMessage from '../copilotkit/sub-com/CommonTextMessage.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLastMsg, searchTreeData } from '@/apis/inter-api/uns.ts';
import DifyMessage from '@/components/copilotkit/sub-com/DifyMessage.tsx';
import MermaidCom from './sub-com/MermaidCom.tsx';

export enum Page {
  Uns = 'uns',
}

export enum UnsPageOperations {
  UnsOperation = 'unsOperation',
}

export const AVAILABLE_OPERATIONS_PER_PAGE = {
  [Page.Uns]: Object.values(UnsPageOperations),
};

const SuggestionsContext = ({ children }: { children: ReactNode }) => {
  // 提示语
  useCopilotChatSuggestions({
    instructions: `根据navigateToPage、unsRelationalOperationDescriptions、unsTimeSeriesOperationDescriptions、useMermaid等action生成提示语，方便用户操作`,
    minSuggestions: 1,
    maxSuggestions: 3,
  });

  return children;
};

// 通用的readable和action放这里
const CopilotContext: FC<{ children: ReactNode; copilotCatRef: any }> = ({ children }) => {
  const aiStore = useAiContext();
  const routesStore = useRoutesContext();
  const handleNavigate = useMenuNavigate();
  const routeMap = routesStore?.pickedRoutesOptions?.map((item) => item.name);
  const [currentPage, setPage] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setPage(location.pathname);
  }, [location.pathname]);

  // 数据可读
  useCopilotReadable({
    description: 'pages是页面集合，',
    value: {
      pages: routeMap,
      operations: AVAILABLE_OPERATIONS_PER_PAGE,
      currentPage,
    },
  });
  const context = useCopilotContext();

  // 页面跳转action
  useCopilotAction({
    name: 'navigateToPage',
    description: `首先判断当前页面的page地址，如果已经是该page，不跳转；如果不是，进行操作`,
    parameters: [
      {
        name: 'page',
        type: 'string',
        description: '要跳转的页面',
        required: true,
        enum: routeMap,
      },
    ],
    followUp: false,
    renderAndWaitForResponse: (props) => {
      const { args, handler, status, result } = props;
      const { page } = args;
      if (!handler) {
        if (status === 'complete') {
          return <CommonTextMessage>{result}</CommonTextMessage>;
        }
      }

      if (status === 'inProgress') {
        return <InlineLoading status="active" description="Loading data..." />;
      }

      return (
        <Space>
          <div style={{ color: '#525252' }}>Navigate to {page}?</div>
          <Button
            type="primary"
            onClick={() => {
              const info = routesStore?.pickedRoutesOptions?.find((f) => f.name === page);
              if (!info) {
                handler?.('no found');
              } else {
                handleNavigate?.(info);
                handler?.('is: ' + page!);
              }
            }}
          >
            Yes
          </Button>
          <Button onClick={() => handler?.('user cancelled')}>No</Button>
        </Space>
      );
    },
  });

  // 关系型数据库action
  useCopilotAction({
    name: 'unsRelationalOperation',
    description: unsRelationalOperationDescriptions,
    parameters: [
      {
        name: 'page',
        type: 'string',
        description: '分析出当前页面所处的位置',
        required: true,
        enum: routeMap,
      },
      {
        name: 'Namespace',
        type: 'string',
        description:
          '示例值：aa' +
          '命名空间的描述，引导用户方式为：填写Namespace需要先命名，命名方式一般为aa，您可以参考下' +
          '要求：该字段不宜过长',
        required: true,
      },
      {
        name: 'modelDescription',
        type: 'string',
        description: '模型的描述，引导用户方式为：填写模型的描述信息，方便后续理解模型的用处',
      },
      {
        name: 'FileName',
        type: 'string',
        description:
          '示例值：bb' +
          '命名空间的描述，引导用户方式为：填写Namespace需要先命名，命名方式一般为bb，您可以参考下' +
          '要求：该字段不宜过长',
        required: true,
      },
      {
        name: 'fileDescription',
        type: 'string',
        description: '文件的描述，引导用户方式为：填写文件的描述信息，方便后续理解文件的用处',
      },
      {
        name: 'dataType',
        type: 'number',
        description:
          '示例值：2 （关系型）' +
          '数据库类型，在当前场景下默认值2，引导方式为：当前只支持关系型，更多类型敬请期待' +
          '注意事项：不需要让用户知道默认值，让用户输入文本，请你进行对应映射' +
          '映射关系：关系型为2',
        enum: [2],
      },
      {
        name: 'fields',
        type: 'object[]',
        description:
          '模型字段的类型集合，引导方式为：请填写模型的字段映射方式，一般以name:gender,type:string的方式来表达，您可以试试看',
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: '',
          },
          {
            name: 'type',
            type: 'string',
            description: '',
          },
        ],
      },
      {
        name: 'saveAvailable',
        type: 'boolean',
        description:
          '默认值：false' +
          '是否保存，引导方式为：如果需要自动保存那么就告诉我需要保存，如果不需要的话，也有助于您排查问题和修改',
      },
    ],
    // disabled: true,
    // 阻止回答
    followUp: false,
    handler: (args) => {
      console.log('uns页 关系型：', args, currentPage);
      if (args) {
        aiStore.setAiResult('uns', getUnsRelationalStep(args, 'relational'));
      }
      if (currentPage !== '/uns') {
        navigate('/uns');
      }
    },
    render: (props) => {
      const { status } = props;
      if (status === 'inProgress') {
        return <InlineLoading status="active" description="Loading data..." />;
      }
      return <CommonTextMessage>uns operation</CommonTextMessage>;
    },
  });

  // 时序型数据库action
  useCopilotAction({
    name: 'unsTimeSeriesOperationDescriptions',
    description: unsTimeSeriesOperationDescriptions,
    parameters: [
      {
        name: 'page',
        type: 'string',
        description: '分析出当前页面所处的位置',
        required: true,
        enum: routeMap,
      },
      {
        name: 'Namespace',
        type: 'string',
        description:
          '示例值：aa' +
          '命名空间的描述，引导用户方式为：填写Namespace需要先命名，命名方式一般为aa，您可以参考下' +
          '要求：该字段不宜过长',
        required: true,
      },
      {
        name: 'modelDescription',
        type: 'string',
        description: '模型的描述，引导用户方式为：填写模型的描述信息，方便后续理解模型的用处',
      },
      {
        name: 'FileName',
        type: 'string',
        description:
          '示例值：bb' +
          '命名空间的描述，引导用户方式为：填写Namespace需要先命名，命名方式一般为bb，您可以参考下' +
          '要求：该字段不宜过长',
        required: true,
      },
      {
        name: 'fileDescription',
        type: 'string',
        description: '文件的描述，引导用户方式为：填写文件的描述信息，方便后续理解文件的用处',
      },
      {
        name: 'dataType',
        type: 'number',
        description:
          '示例值：1' +
          '默认值：1' +
          '引导方式为：当前只支持时序型，更多类型敬请期待' +
          '注意事项：不需要让用户知道默认值，让用户输入文本，请你进行对应映射' +
          '映射关系：时序型为1',
        enum: [1],
      },
      {
        name: 'fields',
        type: 'object[]',
        description:
          '模型字段的类型集合，引导方式为：请填写模型的字段映射方式，一般以name:gender,type:string，index:1的方式来表达，您可以试试看',
        attributes: [
          {
            name: 'name',
            type: 'string',
            description: '',
          },
          {
            name: 'type',
            type: 'string',
            description: '',
          },
          {
            name: 'index',
            type: 'number',
            description: '下标，只能0和正整数',
          },
        ],
      },
      {
        name: 'instanceDescription',
        type: 'string',
        description: '实例的描述，引导方式为:填写实例的描述有助于后续理解实例',
      },
      {
        name: 'protocol',
        type: 'object',
        description: '模型字段的协议',
        attributes: [
          {
            name: 'protocol',
            type: 'string',
            description:
              '协议类型,目前只支持modbus，引导方式为:请填写需要的协议类型，我们暂时只支持modubus协议您可以试试看',
            enum: ['modbus'],
            default: 'modbus',
            required: true,
          },
          {
            name: 'serverName',
            type: 'string',
            description:
              '协议地址名称，用户没有就随机生成，默认值：随机生成，注意事项：没有必要的话不需要让用户知道该字段',
          },
          {
            name: 'host',
            type: 'string',
            description: '主机host，引导方式：需要填写物联网设备的IP才能找到该设备哦',
            required: true,
          },
          {
            name: 'port',
            type: 'number',
            description: '端口号，引导方式：需要填写物联网设备的端口才能找到该设备哦',
            required: true,
          },
          {
            name: 'unitId',
            type: 'number',
            description: '唯一id，引导方式：该ID是MODBUS协议中唯一标识设备的重要字段',
            required: true,
          },
          {
            name: 'fc',
            type: 'string',
            description:
              'Function Code（功能码）的缩写。它用于指定主设备（Master）向从设备（Slave）发送的请求类型，' +
              '引导方式：它定义了主从设备间的交互方式一般都会选择读取保持寄存器的方式，大家一般都会选择HoldingRegister(3)' +
              '默认值:HoldingRegister',
            default: 'HoldingRegister',
          },
          {
            name: 'address',
            type: 'string',
            description:
              '表示操作的起始寄存器地址或线圈地址,主要目的是说明从地址的第几位开始读' +
              '引导方式：该字段主要是标记读取的位置，一般用户都会从第0为开始读',
          },
          {
            name: 'quantity',
            type: 'string',
            description:
              '指定了从起始地址开始操作的数据数量' +
              '引导方式：表明了读取的数量' +
              '举例：在数组[1,2,3,4,5]中，address为1,quantity为3，那么采集到的数据将会是[2,3,4]',
          },
          {
            name: 'pollRate',
            type: 'object',
            description: '拉取数据的频率设置，引导方式：您希望以什么样的频率拉取该数据呢？' + '默认值：1s',
            attributes: [
              {
                name: 'value',
                type: 'number',
                description: '正整数',
                default: 1,
              },
              {
                name: 'unit',
                type: 'string',
                description: '时间单位',
                enum: ['ms', 's', 'm', 'h'],
                default: 's',
              },
            ],
          },
        ],
      },
      {
        name: 'saveAvailable',
        type: 'boolean',
        description:
          '默认值：false' +
          '是否保存，引导方式为：如果需要自动保存那么就告诉我需要保存，如果不需要的话，也有助于您排查问题和修改',
      },
    ],
    // 阻止回答
    followUp: false,
    disabled: true,
    handler: (args) => {
      console.log('uns页 时序型：', args, currentPage);
      if (args) {
        aiStore.setAiResult('uns', getTimeSeriesStep(args, 'timeSeries'));
      }
      if (currentPage !== '/uns') {
        navigate('/uns');
      }
    },
    render: (props) => {
      const { status } = props;
      if (status === 'inProgress') {
        return <InlineLoading status="active" description="Loading data..." />;
      }
      return <CommonTextMessage>uns operation</CommonTextMessage>;
    },
  });

  // 跳转到Apps生成页，带入参数
  useCopilotAction({
    name: 'createApp',
    description: createAppDescriptions,
    parameters: [
      {
        name: 'prompt',
        type: 'string',
        description: '把用户输入的内容原封不动的传递到下一步',
        required: true,
      },
    ],
    // 阻止回答
    followUp: false,
    handler: (args) => {
      console.log('app-gui：', args, currentPage);
      if (currentPage === '/app-gui') {
        if (args) {
          aiStore.setAiResult('app-gui', args.prompt);
        }
      } else {
        if (args) {
          aiStore.setAiResult('app-gui', args.prompt);
        }
        navigate('/app-gui');
      }
    },
    render: (props) => {
      const { status } = props;
      if (status === 'inProgress') {
        return <InlineLoading status="active" description="Loading data..." />;
      }
      return <CommonTextMessage>apps operation</CommonTextMessage>;
    },
  });

  // 查询topic
  useCopilotAction({
    name: 'queryTopic',
    description: `# Topic分析职责与脚本说明
## 职责说明
作为Topic分析的负责人，你可以帮助用户分析系统中所有的Topic，并分析Topic中的payload。根据用户的需求理解payload内容。将内容分析后，引导用户理解数据。
## 功能场景分析与脚本说明
**场景描述**
根据用户输入，判断用户需求，在需求是分析Topic时候触发该场景
**用户需求举例**
我想知道tag1的温度是多少，这个温度是否会影响我得设备运行。
### 注意事项
Topic中包含了分析数据的关键信息，尽可能结合Topic去对数据进行充分理解。
### 当前步骤
将用户需求总结为即将要去查询的Topic关键词，为下一步在所有Topic列表中查询做准备`,
    parameters: [
      {
        name: 'topic',
        type: 'string',
        description: '用户要查询的topic内容，例如 我想知道tag1的温度是多少, topic就是 tag1',
        required: true,
      },
      {
        name: 'requirement',
        type: 'string',
        description: '理解用户需求，将需求传递给下一个脚本进一步分析',
        required: true,
      },
    ],
    // 阻止回答
    followUp: false,
    renderAndWaitForResponse: (props) => {
      const { args, handler, status, result } = props;
      const { topic, requirement } = args;
      const generateCode2 = new CopilotTask({
        actions: [
          {
            name: 'getPayload',
            description: `
# Payload分析职责与脚本说明
## 职责说明
作为Payload分析的负责人，你可以帮用户分析指定的Topic的Payload，根据*${requirement}的需求**充分理解${topic}*和payload之间的关系将内容分析后，引导用户理解数据。
### 注意事项
1.用户需求，Topic，Payload之前有很强的关联关系。
2.请严格使用与我提问相同的语言来回答所有问题。不要切换语言，即使我使用非母语提问。
                        `,
            parameters: [
              {
                name: 'analysis_summary',
                type: 'string',
                description: `根据用户需求，和得到的payload进行结合和分析。注意要言简意赅。`,
                required: true,
              },
            ],
            handler: async (props: any) => {
              const { analysis_summary } = props;
              handler?.(`${JSON.stringify(analysis_summary)}`);
            },
          },
        ],
        instructions: `从我给你的Payload中对用户需求进行分析，注意不要让用户知道分析过程。只需要把分析结果和Payload内容进行分析展示就可以了。该分析功能为独立功能，不应该与Pages数组，或其他进行共同分析，`,
        includeCopilotActions: false,
      });
      const generateCode = new CopilotTask({
        actions: [
          {
            name: 'getTopicList',
            description: ` # Topic分析职责与脚本说明
## 职责说明
作为Topic检索的负责人，你可以在大量的Topic中，精准的找到最符合用户需求的Topic完整路径。根据用户提供的*${topic}*进行分析，查找
**用户需求举例**
压缩机一号是否在正常运行
**分析过程样例**
1 topic 列表为：
    /compressor/compressor1
    /compressor/compressor2
    /Company/asset/compressor/compressor3
    /company/Freezonex
2 compressor1语用户需求‘压缩机一号’最为接近。那么/compressor/compressor1为用户需求的完整路径。
### 注意事项
1. Topic中包含了分析数据的关键信息，尽可能结合*${requirement}*的需求去充分理解。
2. 只允许从我为你定义的数据中解析，不允许生成topic，只能从Topic列表中挑选最符合需求的，并且Topic应该为完整路径，不应该截取。`,
            parameters: [
              {
                name: 'select_topic',
                type: 'string',
                description: '最符合用户需求的topic',
                required: true,
              },
            ],
            handler: async ({ select_topic }: any) => {
              getLastMsg({ topic: select_topic }).then((data: any) => {
                try {
                  const payload = data?.data;
                  generateCode2.run(context, payload);
                } catch (e) {
                  console.log(e);
                  handler?.(`topic query fail`);
                }
              });
            },
          },
        ],
        instructions: `从我给你的Topic数据中找到用户需求的Topic，注意不要让语言成为定位Topic的障碍。`,
        includeCopilotActions: false,
      });

      if (status === 'executing') {
        // 查询所有topic
        searchTreeData({ type: 2, p: 1, sz: 10000 }).then((topicList) => {
          generateCode.run(context, topicList);
        });
      }
      if (status === 'complete') {
        return <CommonTextMessage>{result}</CommonTextMessage>;
      }
      return <InlineLoading status="active" description="Loading data..." />;
    },
  });

  // 调用dify的api
  useCopilotAction({
    name: 'queryDifyApi',
    description: '当用户发起 社保公积金 相关问询时候触发',
    followUp: false,
    parameters: [
      {
        name: 'prompt',
        type: 'string',
        description: '把用户输入的内容原封不动的传递到下一步',
        required: true,
      },
    ],
    renderAndWaitForResponse: (props) => {
      return <DifyMessage {...props} />;
    },
  });

  useCopilotAction({
    name: 'useMermaid',
    description: `
    # Mermaid图表绘制职责与脚本说明
    ## 职责说明
    你是一个图表绘制专家，分析用户的问题和数据等，使用Mermaid语法输出专业的图表。
    支持的图表类型：流程图、时序图、类图、状态图、柱状图、实体关系图、用户旅程图、甘特图、饼图、象限图、需求图、Gitgraph 图、C4 图、思维导图、时间线图、ZenUML、桑基图、XY 图、框图、数据包图、看板图、架构图
    **举例**
    XY图示例:
      xychart-beta
      title "Sales Revenue"
      x-axis [jan, feb, mar, apr, may, jun, jul]
      y-axis "Revenue (in $)" 4000 --> 11000
      bar [5000, 6000, 7500, 8200, 9500, 10500, 11000]
      line [5000, 6000, 7500, 8200, 9500, 10500, 11000]

    ###注意
    解析用户需求，选择合适的图表输出，只输出图表即可，不要有额外的回复`,
    parameters: [
      {
        name: 'code',
        type: 'string',
        description: '输出的Mermaid语法的code',
        required: true,
        enum: routeMap,
      },
    ],
    followUp: false,
    render: (props: any) => {
      const { code } = props.args;
      const { status } = props;
      console.log('props--action', props, code);
      if (status === 'inProgress') {
        return <InlineLoading status="active" description="Loading data..." />;
      }
      return <MermaidCom code={`${code}`} />;
    },
  });

  return routesStore?.systemInfo?.llmType === 'openai' ? <SuggestionsContext>{children}</SuggestionsContext> : children;
};

export default observer(CopilotContext);
