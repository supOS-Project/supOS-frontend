import { html } from 'htm/preact';

import { useService } from 'bpmn-js-properties-panel';
import MultiSelectEntry from './../entries/multiple-select';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getUserManageList } from '@/apis/inter-api/user-manage';

export default function (element: any) {
  return {
    id: 'candidateUsers',
    element,
    component: CandidateUsers,
  };
}

function CandidateUsers(props: { element: any; id: any }) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  // 将字符串值转换为数组
  const getValue = () => {
    const candidateUsers = element.businessObject.candidateUsers || '';
    return candidateUsers.split(',').filter((v: string) => v);
  };

  // 将数组转换为字符串保存
  const setValue = (values: string[]) => {
    modeling.updateProperties(element, {
      candidateUsers: values.join(','),
    });
  };

  const [dataSource, setDataSource] = useState<any[]>([]);

  // 获取用户数据（保持不变）
  useEffect(() => {
    getUserManageList({ pageSize: 10000, page: 1 }).then((res) => {
      setDataSource(res.data);
    });
  }, []);

  // 生成选项（移除 <none> 选项）
  const getOptions = () => {
    return dataSource.map((item) => ({
      label: item.preferredUsername,
      value: item.id,
    }));
  };

  return html`
    <${MultiSelectEntry}
      id=${id}
      label=${translate('Candidate users')}
      getValue=${getValue}
      setValue=${setValue}
      getOptions=${getOptions}
    />
  `;
}
