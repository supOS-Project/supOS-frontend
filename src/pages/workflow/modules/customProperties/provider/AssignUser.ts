/*
 * @Author: dongweipeng dongweipeng@supos.com
 * @Date: 2025-03-06 13:13:33
 * @LastEditors: dongweipeng dongweipeng@supos.com
 * @LastEditTime: 2025-03-10 09:56:19
 * @Description:
 */
import { html } from 'htm/preact';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

// import hooks from the vendored preact package
import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { getUserManageList } from '@/apis/inter-api/user-manage';

export default function (element: any) {
  return {
    id: 'assignee',
    element,
    component: AssignUser,
    isEdited: isSelectEntryEdited,
  };
}

function AssignUser(props: { element: any; id: any }) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.assignee || '';
  };

  const setValue = (value: any) => {
    return modeling.updateProperties(element, {
      assignee: value,
    });
  };

  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    getUserManageList({ pageSize: 10000, page: 1 })
      .then((res) => {
        const { data } = res;
        setDataSource(data);
      })
      .catch((error) => console.error(error));
  }, [setDataSource]);

  const getOptions = () => {
    return [
      { label: `${translate('<none>')}`, value: undefined },
      ...dataSource.map((item) => ({
        label: item.preferredUsername,
        value: item.id,
      })),
    ];
  };

  return html`<${SelectEntry}
    id=${id}
    element=${element}
    description=${translate('Apply a black magic assignee')}
    label=${translate('Assignee')}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
  />`;
}
