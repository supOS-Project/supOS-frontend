// require('dotenv').config();
const express = require('express');
const {
  CopilotRuntime,
  OpenAIAdapter,
  LangChainAdapter,
  copilotRuntimeNodeHttpEndpoint,
  langGraphPlatformEndpoint,
} = require('@copilotkit/runtime');
const OpenAI = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatOllama } = require('@langchain/ollama');
const { ChatAnthropic } = require('@langchain/anthropic');
// const { HttpsProxyAgent } = require('https-proxy-agent');

// const { ChatAlibabaTongyi } = require('@langchain/community/chat_models/alibaba_tongyi');
// const agentProxy = new HttpsProxyAgent('http://127.0.0.1:7897');

const axios = require('axios');



const app = express();

// coplilotkit端口号
const COPILOTKIT_SERVER_PORT = process.env.COPILOTKIT_SERVER_PORT || 4000;
const DOCKER_HOST = process.env.DOCKER_HOST || 'host.docker.internal'
const DOCKER_PORT = process.env.DOCKER_PORT || 2375

// 目前支持ollama、openai、anthropic、tongyi
const LLM_TYPE = process.env.LLM_TYPE || 'openai';

// llama的配置
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_BASEURL = process.env.OLLAMA_BASEURL || 'http://office.unibutton.com:11435';

// openai的配置
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'apikey';
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || 'gpt-4o';

// anthropic的配置
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'apikey';
const ANTHROPIC_API_MODEL = process.env.ANTHROPIC_API_MODEL || 'claude-3-7-sonnet-thinking';

// tongyi的配置
const TONGYI_API_KEY = process.env.TONGYI_API_KEY || 'apikey';
const TONGYI_API_MODEL = process.env.TONGYI_API_MODEL || 'qwen-plus';
const TONGYI_API_BASEURL = process.env.TONGYI_API_BASEURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const ollamaModel = new ChatOllama({
  model: OLLAMA_MODEL, // Default value.
  baseUrl: OLLAMA_BASEURL,
});

const openaiModel = new ChatOpenAI(
  {
    model: OPENAI_API_MODEL, // Default value.
    apiKey: OPENAI_API_KEY, // Default value.
    // baseUrl: OLLAMA_BASEURL,
  }
  // {
  //   httpAgent: agentProxy,
  // }
);

// const openai = new OpenAI({
//   apiKey: OPENAI_API_KEY || '',
// });

// const serviceAdapterByOpenai = new OpenAIAdapter({ openai, model: OPENAI_API_MODEL });

const anthropicModel = new ChatAnthropic({
  model: ANTHROPIC_API_MODEL,
  apiKey: ANTHROPIC_API_KEY,
});

// 社区提供的封装不支持tools使用
// const alibabaTongyiModel = new ChatAlibabaTongyi({
//   // model: 'qwen-plus',
//   alibabaApiKey: TONGYI_API_KEY, // In Node.js defaults to process.env.TONGYI_API_KEY
//   // tools: tools,
//   streaming: true,
// });

const alibabaTongyiModel = new OpenAI({
  apiKey: TONGYI_API_KEY,
  baseURL: TONGYI_API_BASEURL,
});

const serviceAdapterByllama = new LangChainAdapter({
  chainFn: async ({ messages, tools }) => {
    // console.log(messages, '---message---', tools, '---tools---', '------ollama 模型-----');
    return ollamaModel.bindTools(tools).stream(messages);
    // or optionally enable strict mode
    // return ollamaModel.bindTools(tools, { strict: true }).stream(messages);
  },
});

const serviceAdapterByOpenai = new LangChainAdapter({
  chainFn: async ({ messages, tools }) => {
    console.log(messages, '---message---', tools, '---tools---', '----openai 模型-----');
    return openaiModel.bindTools(tools).stream(messages);
    // or optionally enable strict mode
    // return ollamaModel.bindTools(tools, { strict: true }).stream(messages);
  },
});

const serviceAdapterByAnthropic = new LangChainAdapter({
  chainFn: async ({ messages, tools }) => {
    console.log(messages, '---message---', tools, '---tools---', '----anthropic 模型-----');
    return anthropicModel.bindTools(tools).stream(messages);
  },
});

const serviceAdapterByTongyi = new OpenAIAdapter({ openai: alibabaTongyiModel, model: TONGYI_API_MODEL });

const llmType = {
  // openai: serviceAdapterByOpenai,
  ollama: serviceAdapterByllama,
  openai: serviceAdapterByOpenai,
  tongyi: serviceAdapterByTongyi,
  anthropic: serviceAdapterByAnthropic,
};

app.get('/open-api/supos/health', (req, res) => {
  const dockerAPI = axios.create({
    baseURL: 'http://' + DOCKER_HOST + ':' + DOCKER_PORT + '/containers'
  });

  // 获取所有容器
  dockerAPI.get('/json?all=true&filters=%7B%22network%22%3A%5B%22supos_default_network%22%5D%7D')
    .then(r => {
      let total = [];
      let running = [];
      let stopped = [];
      let platformStatus = "running";
      for (let k in r.data) {
        let containerName = r.data[k].Names[0].substring(1);
        total.push(containerName);
        if ("running" === r.data[k].State) {
          running.push(containerName);
        } else {
          stopped.push(containerName);
          if (containerName === "backend") {
            platformStatus = "stop";
          }
        }
      }
      let data = {
        status: platformStatus,
        overview: {
          total: total.length,
          running: running.length,
          stop: stopped.length
        },
        container: {
          running: running,
          stop: stopped
        }
      }
      res.status(200).json({data: data})
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({msg: "docker网络异常"})
    });
});

app.use('/copilotkit', (req, res, next) => {
  const runtime = new CopilotRuntime({
    remoteEndpoints: [
      langGraphPlatformEndpoint({
        deploymentUrl: `${process.env.AGENT_DEPLOYMENT_URL || 'http://localhost:8123'}`,
        langsmithApiKey: process.env.LANGSMITH_API_KEY,
        agents: [
          {
            name: 'sample_agent',
            description: 'A helpful LLM agent.',
          },
        ],
      }),
    ],
  });
  // const runtime = new CopilotRuntime();

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter: llmType?.[LLM_TYPE] || serviceAdapterByOpenai,
  });
  return handler(req, res, next);
});

app.listen(COPILOTKIT_SERVER_PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Listening at :${COPILOTKIT_SERVER_PORT}/copilotkit`);
  }
});
