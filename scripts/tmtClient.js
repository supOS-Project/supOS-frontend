// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
import tencentcloud from 'tencentcloud-sdk-nodejs-tmt';
import fs from 'fs';
import { parse } from 'dotenv';

let config = {};

// 检查.env.local文件是否存在
if (fs.existsSync('./.env.local')) {
  // 读取.env.local文件并解析
  const envFile = fs.readFileSync('./.env.local', 'utf-8');
  config = parse(envFile);
}

const TmtClient = tencentcloud.tmt.v20180321.Client;
// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性
// 以下代码示例仅供参考，建议采用更安全的方式来使用密钥
// 请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: config.SECRETID,
    secretKey: config.SECRETKEY,
  },
  region: 'ap-shanghai',
  profile: {
    httpProfile: {
      endpoint: 'tmt.tencentcloudapi.com',
    },
  },
};

const targets = {
  'en-US': 'en',
  // zh-TW（繁体中文）、
  // ja（日语）、
  // ko（韩语）、
  // fr（法语）、
  // es（西班牙语）、
  // it（意大利语）、
  // de（德语）、
  // tr（土耳其语）、
  // ru（俄语）、
  // pt（葡萄牙语）、
  // vi（越南语）、
  // id（印尼语）、
  // th（泰语）、
  // ms（马来语）、
  // ar（阿拉伯语）
};

let client;

const translateText = (txt, target) => {
  if (!clientConfig?.credential?.secretId) {
    console.log('没有配置腾讯云密钥，跳过自动翻译');
    return Promise.resolve('');
  }

  if (!client) {
    client = new TmtClient(clientConfig);
  }
  const params = {
    SourceText: txt,
    Source: 'zh',
    Target: targets[target],
    ProjectId: 0,
  };

  return new Promise((resolve, reject) => {
    client.TextTranslate(params).then(
      (data) => {
        // 首字母大写处理
        const translatedText = data.TargetText;
        const capitalizedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
        resolve(capitalizedText);
      },
      (err) => {
        console.log('error', err);
        resolve('');
      }
    );
  });
};

export default translateText;
