import { getIntl } from '@/stores/i18n-store.ts';

export const CONTROL_WHITE_LIST = [
  'Text',
  'Number',
  'Date',
  'Textarea',
  'Radio',
  'Checkbox',
  'Select',
  'SelectMultiple',
  'Member',
  'Department',
  'SubForm',
  'Switch',
];

export const BASIC_OPERATORS = [
  { operatorName: '+', operatorValue: '+' },
  { operatorName: '-', operatorValue: '-' },
  { operatorName: '*', operatorValue: '*' },
  { operatorName: '/', operatorValue: '/' },
  { operatorName: '(', operatorValue: '(' },
  { operatorName: ')', operatorValue: ')' },
];

export const CONDITION_OPERATORS = [
  { operatorName: '>', operatorValue: '>' },
  { operatorName: '<', operatorValue: '<' },
  { operatorName: '>=', operatorValue: '>=' },
  { operatorName: '<=', operatorValue: '<=' },
  { operatorName: '==', operatorValue: '==' },
  { operatorName: '!=', operatorValue: '!=' },
];

export const FUNCTIONS_TYPE = [
  // {
  //   cateName: messages.logicFun,
  //   cateValue: 'logic',
  // },
  {
    cateName: getIntl('mathFun'),
    cateValue: 'math',
  },
  // {
  //   cateName: messages.dateFun,
  //   cateValue: 'date',
  // },
  // {
  //   cateName: messages.textFun,
  //   cateValue: 'text',
  // },
  // {
  //   cateName: '对象函数',
  //   cateValue: 'object',
  // },
];

export interface FunctionConfig {
  label: string;
  name: string;
  intro: string;
  usage: string;
  example: string;
}

export const FUNCTIONS_DATA: { [index: string]: FunctionConfig[] } = {
  // logic: [
  //   {
  //     label: '逻辑与',
  //     name: 'AND()',
  //     intro: '如果所有参数都为真，AND函数返回布尔值true，否则返回布尔值 false',
  //     usage: 'AND(逻辑表达式1,逻辑表达式2,...)',
  //     example: 'AND({语文成绩}>90,{数学成绩}>90,{英语成绩}>90)，如果三门课成绩都> 90，返回true，否则返回false',
  //   },
  //   {
  //     label: '逻辑或',
  //     name: 'OR()',
  //     intro: '如果任意参数为真，OR 函数返回布尔值true；如果所有参数为假，返回布尔值false。',
  //     usage: 'OR(逻辑表达式1,逻辑表达式2,...)',
  //     example: 'OR({语文成绩}>90,{数学成绩}>90,{英语成绩}>90)，任何一门课成绩> 90，返回true，否则返回false',
  //   },
  //   {
  //     label: '逻辑真',
  //     name: 'TRUE()',
  //     intro: 'TRUE函数返回布尔值true',
  //     usage: 'TRUE()',
  //     example: '略',
  //   },
  //   {
  //     label: '逻辑假',
  //     name: 'FALSE()',
  //     intro: 'FALSE函数返回布尔值false',
  //     usage: 'FALSE()',
  //     example: '略',
  //   },
  //   {
  //     label: '条件运算',
  //     name: 'IF()',
  //     intro: 'IF函数判断一个条件能否满足；如果满足返回一个值，如果不满足则返回另外一个值',
  //     usage: 'IF(逻辑表达式,为true时返回的值,为false时返回的值)',
  //     example: 'IF({语文成绩}>60,"及格","不及格")，当语文成绩>60时返回及格，否则返回不及格。',
  //   },
  //   {
  //     label: '多条件',
  //     name: 'IFS()',
  //     intro: 'IFS函数检查是否满足一个或多个条件，且返回符合第一个TRUE条件的值，IFS可以取代多个嵌套IF语句。',
  //     usage: 'IFS(逻辑表达式1,逻辑表达式1为true返回该值,逻辑表达式2,逻辑表达式2为true返回该值,...)',
  //     example:
  //       'IFS({语文成绩}>90,"优秀",{语文成绩}>80,"良好",{语文成绩}>=60,"及格",{语文成绩}<60,"不及格")，根据成绩返回对应的评价。',
  //   },
  //   {
  //     label: '取反',
  //     name: 'NOT()',
  //     intro: 'NOT函数返回与指定表达式相反的布尔值。',
  //     usage: 'NOT(逻辑表达式)',
  //     example: 'NOT({语文成绩}>60)，如果语文成绩大于60返回false，否则返回true',
  //   },
  //   {
  //     label: '异或',
  //     name: 'XOR()',
  //     intro: 'XOR函数可以返回所有参数的异或值',
  //     usage: 'XOR(逻辑表达式1, 逻辑表达式2,...)',
  //     example:
  //       'XOR({语文成绩}>90,{数学成绩}>90)，如果两门成绩都>90,返回false；如果两门成绩都<90，返回false；如果其中一门>90，另外一门<90，返回true',
  //   },
  // ],
  math: [
    {
      label: getIntl('math0label'),
      name: 'ABS()',
      intro: getIntl('math0intro'),
      usage: getIntl('math0usage'),
      example: getIntl('math0example'),
    },
    {
      label: getIntl('math1label'),
      name: 'AVERAGE()',
      intro: getIntl('math1intro'),
      usage: getIntl('math1usage'),
      example: getIntl('math1example'),
    },
    {
      label: getIntl('math2label'),
      name: 'COUNT()',
      intro: getIntl('math2intro'),
      usage: getIntl('math2usage'),
      example: getIntl('math2example'),
    },
    {
      label: getIntl('math3label'),
      name: 'FIXED()',
      intro: getIntl('math3intro'),
      usage: getIntl('math3usage'),
      example: getIntl('math3example'),
    },
    {
      label: getIntl('math4label'),
      name: 'INT()',
      intro: getIntl('math4intro'),
      usage: getIntl('math4usage'),
      example: getIntl('math4example'),
    },
    {
      label: getIntl('math5label'),
      name: 'LOG()',
      intro: getIntl('math5intro'),
      usage: getIntl('math5usage'),
      example: getIntl('math5example'),
    },
    {
      label: getIntl('math6label'),
      name: 'MOD()',
      intro: getIntl('math6intro'),
      usage: getIntl('math6usage'),
      example: getIntl('math6example'),
    },
    {
      label: getIntl('math7label'),
      name: 'MAX()',
      intro: getIntl('math7intro'),
      usage: getIntl('math7usage'),
      example: getIntl('math7example'),
    },
    {
      label: getIntl('math8label'),
      name: 'MIN()',
      intro: getIntl('math8intro'),
      usage: getIntl('math8usage'),
      example: getIntl('math8example'),
    },
    {
      label: getIntl('math9label'),
      name: 'POWER()',
      intro: getIntl('math9intro'),
      usage: getIntl('math9usage'),
      example: getIntl('math9example'),
    },
    {
      label: getIntl('math10label'),
      name: 'PRODUCT()',
      intro: getIntl('math10intro'),
      usage: getIntl('math10usage'),
      example: getIntl('math10example'),
    },
    // {
    //   label: getIntl('math14label'),
    //   name: 'RANDOM()',
    //   intro: getIntl('math14intro'),
    //   usage: getIntl('math14usage'),
    //   example: getIntl('math14example'),
    // },
    {
      label: getIntl('math11label'),
      name: 'SQRT()',
      intro: getIntl('math11intro'),
      usage: getIntl('math11usage'),
      example: getIntl('math11example'),
    },
    {
      label: getIntl('math12label'),
      name: 'SUM()',
      intro: getIntl('math12intro'),
      usage: getIntl('math12usage'),
      example: getIntl('math12example'),
    },
    // {
    //   label: getIntl('math13label'),
    //   name: 'SUMPRODUCT()',
    //   intro: getIntl('math13intro'),
    //   usage: getIntl('math13usage'),
    //   example: getIntl('math13example'),
    // },
  ],
  // date: [
  //   {
  //     label: '日期对象',
  //     name: 'DATE()',
  //     intro: 'DATE函数可以将时间戳转换为日期对象',
  //     usage: 'DATE(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '第几日',
  //     name: 'DAY()',
  //     intro: 'DAY函数可以获取某日期是当月的第几日',
  //     usage: 'DAY(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '相差天数',
  //     name: 'DAYS()',
  //     intro: 'DAYS函数可以返回两个日期之间相差的天数。',
  //     usage: 'DAYS(结束日期,开始日期)',
  //     example: '略',
  //   },
  //   {
  //     label: '时间差值',
  //     name: 'DATEDIF()',
  //     intro: 'DATEDIF函数可以计算两个日期时间相差的年数、月数、天数、小时数、分钟数、秒数。',
  //     usage: 'DATEDIF(开始时间,结束时间,[单位])，单位可以是 "y" 、"M"、"d"、"h"、"m"、"s"',
  //     example: 'DATEDIF({下单时间},{付款时间},"h")，如果下单时间是9:00，付款时间为当天10:30，计算得到的小时差为1.5。',
  //   },
  //   {
  //     label: '加减天数',
  //     name: 'DATEDELTA()',
  //     intro: 'DATEDELTA函数可以将指定日期加/减指定天数',
  //     usage: 'DATEDELTA(指定日期,需要加减的天数)',
  //     example: '略',
  //   },
  //   {
  //     label: '小时数',
  //     name: 'HOUR()',
  //     intro: 'HOUR函数可以返回某日期的小时数',
  //     usage: 'HOUR(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '月份',
  //     name: 'MONTH()',
  //     intro: 'MONTH返回某日期的月份',
  //     usage: 'MONTH(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '分钟数',
  //     name: 'MINUTE()',
  //     intro: 'MINUTE函数可以返回某日期的分钟数',
  //     usage: 'MINUTE(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '当前时间',
  //     name: 'NOW()',
  //     intro: 'NOW函数可以获取当前时间',
  //     usage: 'NOW()',
  //     example: '略',
  //   },
  //   {
  //     label: '第几秒',
  //     name: 'SECOND()',
  //     intro: 'SECOND函数可以返回某日期的秒数',
  //     usage: 'SECOND(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '今日',
  //     name: 'TODAY()',
  //     intro: 'TODAY函数可以返回今天',
  //     usage: 'TODAY()',
  //     example: '略',
  //   },
  //   {
  //     label: '年份',
  //     name: 'YEAR()',
  //     intro: 'YEAR函数可以返回某日期的年份',
  //     usage: 'YEAR(时间戳)',
  //     example: '略',
  //   },
  //   {
  //     label: '格式化日期对象',
  //     name: 'DATEFORMAT()',
  //     intro: 'DATEFORMAT函数可以将时间戳或其他日期格式转为指定格式',
  //     usage: 'DATEFORMAT(日期, 格式)，"Y"代表年、"M"代表月、"D"代表天、"H"与"h"代表小时、"m"代表分钟、"s"代表秒',
  //     example: `<br />
  //     不带时区，DATEFORMAT("2024-10-01", "YYYY-MM-DD HH:mm:ss")<br />
  //     带时区，DATEFORMAT("2024-10-01", "YYYY-MM-DDTHH:mm:ss+08:00");`,
  //   },
  //   {
  //     label: '加减小时',
  //     name: 'MOVEHOUR()',
  //     intro: '给定时间对象，按小时级别做前后移动',
  //     usage:
  //       'MOVEHOUR(时间对象/时间字符串,需要加减的小时数)；其中时间对象支持类型为日期时间和时间的字段，以及时间标准格式的字符串（例如：YYYY/MM/DD HH:MM:SS、YYYY/MM/DD HH:MM、YYYY/MM/DD HH、YYYY-MM-DD HH:MM:SS、YYYY-MM-DD HH:MM、YYYY-MM-DD HH）、通过日期格式转换函数转换后的时间',
  //     example: 'MOVEHOUR(上班时间,8)，如果上班时间 = 2021-12-15 08:00:00, 小时数 = 8，结果返回2021-12-15 16:00:00；',
  //   },
  //   {
  //     label: '加减分钟',
  //     name: 'MOVEMINUTE()',
  //     intro: '给定时间对象，按分钟级别做前后移动',
  //     usage:
  //       'MOVEMINUTE(时间对象/时间字符串,需要加减的分钟数)；其中时间对象支持类型为日期时间和时间的字段，以及时间标准格式的字符串（例如：YYYY/MM/DD HH:MM:SS、YYYY/MM/DD HH:MM、YYYY-MM-DD HH:MM:SS、YYYY-MM-DD HH:MM）、通过日期格式转换函数转换后的时间',
  //     example: 'MOVEMINUTE(上班时间,10)，如果上班时间 = 2021-12-15 08:00:00, 分钟数 = 10，结果返回2021-12-15 08:10:00',
  //   },
  // ],
  //   text: [
  //     {
  //       label: '合并文本',
  //       name: 'CONCATENATE()',
  //       intro: 'CONCATENATE函数可以将多个文本合并成一个文本',
  //       usage: 'CONCATENATE(文本1,文本2,...)',
  //       example: 'CONCATENATE("三年二班","周杰伦")会返回"三年二班周杰伦"',
  //     },
  //     {
  //       label: '相等比较',
  //       name: 'EXACT()',
  //       intro: 'EXACT函数可以比较两个文本是否完全相同，完全相同则返回true，否则返回false',
  //       usage: 'EXACT(文本1, 文本2)',
  //       example: 'EXACT({手机号},{中奖手机号})，如果两者相同，返回true，如果不相同，返回false',
  //     },
  //     {
  //       label: '左截取',
  //       name: 'LEFT()',
  //       intro: 'LEFT函数可以从一个文本的第一个字符开始返回指定个数的字符',
  //       usage: 'LEFT(文本,文本长度)',
  //       example: 'LEFT("三年二班周杰伦",2)，返回"三年"，也就是"三年二班周杰伦"的从左往右的前2个字符',
  //     },
  //     {
  //       label: '文本长度',
  //       name: 'LEN()',
  //       intro: 'LEN函数可以获取文本中的字符个数',
  //       usage: 'LEN(文本)',
  //       example: 'LEN("蓝卓数字科技")，返回6，因为这段文本中有6个字符',
  //     },
  //     {
  //       label: '小写转换',
  //       name: 'LOWER()',
  //       intro: 'LOWER函数可以将一个文本中的所有大写字母转换为小写字母',
  //       usage: 'LOWER(文本)',
  //       example: 'LOWER("JAYZ")，返回"jayz"',
  //     },
  //     {
  //       label: '右截取',
  //       name: 'RIGHT()',
  //       intro: 'RIGHT函数可以获取由给定文本右端指定数量的字符构成的文本值',
  //       usage: 'RIGHT(文本,文本长度)',
  //       example: 'RIGHT("三年二班周杰伦",3)，返回"周杰伦"，也就是"三年二班周杰伦"从右往左的前3个字符',
  //     },
  //     {
  //       label: '首尾去空',
  //       name: 'TRIM()',
  //       intro: 'TRIM函数可以删除文本首尾的空格',
  //       usage: 'TRIM(文本)',
  //       example: 'TRIM("   蓝卓工业互联网   ")，返回"蓝卓工业互联网"',
  //     },
  //     {
  //       label: '大写转换',
  //       name: 'UPPER()',
  //       intro: 'UPPER函数可以将一个文本中的所有小写字母转换为大写字母',
  //       usage: 'UPPER(文本)',
  //       example: 'UPPER("jayz")，返回"JAYZ"',
  //     },
  //     {
  //       label: '文本转换',
  //       name: 'TEXT()',
  //       intro: 'TEXT函数可以将数字或日期转化成文本',
  //       usage: 'TEXT(数字)',
  //       example: 'TEXT(3.1415)，返回"3.1415"',
  //     },
  //     {
  //       label: '转化数字',
  //       name: 'VALUE()',
  //       intro: 'VALUE函数可以将文本转化为数字',
  //       usage: 'VALUE(文本)',
  //       example: 'VALUE("3.1415")，返回3.1415',
  //     },
  //     {
  //       label: '判空',
  //       name: 'ISEMPTY()',
  //       intro: 'ISEMPTY函数可以用来判断值是否为空文本、空对象或者空数组',
  //       usage: 'ISEMPTY(文本)',
  //       example: `ISEMPTY({$a})<br />
  // {$a}是空字符串，返回true;<br />
  // {$a}是空集合, 返回true;<br />
  // {$a}是空对象, 返回true;`,
  //     },
  //     {
  //       label: '文本替换',
  //       name: 'REPLACE()',
  //       intro: 'REPLACE函数可以用来根据指定的字符数，将部分文本替换为不同的文本',
  //       usage: 'REPLACE(文本,开始位置,替换长度,新文本)',
  //       example: 'REPLACE("应用编排工具",1,6,"企业低代码开发平台")，返回"企业低代码开发平台"',
  //     },
  //     {
  //       label: '查找文本',
  //       name: 'SEARCH()',
  //       intro: 'SEARCH函数可以用来获取搜索词在原文本中的开始位置',
  //       usage: 'SEARCH(搜索词,原文本)',
  //       example: `SEARCH("2016","定制2016")，返回3，在第三个位置;<br />
  // SEARCH("p","Print")，返回1，在第一个位置，大小写不敏感;<br />
  // SEARCH("Pro","Print")，返回0，表示找不到;`,
  //     },
  //     {
  //       label: '字符串分割',
  //       name: 'SPLIT()',
  //       intro: 'SPLIT函数可以用来将文本按指定字符串分割成数组',
  //       usage: 'SPLIT(文本,分隔符_文本)',
  //       example: 'SPLIT("应用定制-工具","-")，返回[ "应用定制","工具" ]',
  //     },
  //     {
  //       label: '生成随机码',
  //       name: 'UUID()',
  //       intro: 'UUID函数可以用来生成36位字符串的标准UUID',
  //       usage: 'UUID()',
  //       example: 'UUID()，返回如"0c059793-24f3-426b-9c2d-8e136ff37680"的随机数',
  //     },
  //   ],
  // object: [
  //   {
  //     label: '反序列化解析',
  //     name: 'JSONPARSE()',
  //     intro: 'JSONPARSE函数可以将字符串对象字面量(JSON)反序列化为对象字面量，并支持按对象路径取值',
  //     usage: 'JSONPARSE(json, path)',
  //     example:
  //       'JSONPARSE(\'{{"a": "hello", b: 123}}\')会返回 {{"a": "hello", "b": 123}}; JSONPARSE(\'{{"a": "hello", b: 123}}\', \'$.a\')会返回"hello"',
  //   },
  // ],
};

export const DATA_TYPE_MAP: { [key: string]: string } = {
  datetime: '	时间日期',
  counter: '流水号',
  string: '文本',
  long: '整数',
  decimal: '浮点',
  submodel: '子对象',
  linkmodel: '关联模型',
  linkfield: '引用字段',
  syscode: '系统编码',
  'set<file>': '文件集合',
  sysstaff: '员工',
  sysdept: '组织',
  syscompany: '公司',
  sysuser: '用户',
  systime: '时间',
  boolean: '布尔',
  double: '数值',
  option: '单选',
  'set<option>': '多选',
  'range<datetime>': '日期范围',
  'range<long>': '整数范围',
  'range<double>': '浮点范围',
};
