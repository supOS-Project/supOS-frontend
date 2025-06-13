import { ContainerItemProps, RoutesProps } from './types.ts';

/**
 * 通用多分组方法
 * @param data - 要分组的数组
 * @param criteria - 分组标识对象，键是组名，值是判断逻辑的回调函数
 * @returns 分组后的结果对象
 */
type Predicate<T> = (item: T) => boolean;
export type Criteria<T> = Record<string, Predicate<T>>;

export function multiGroupByCondition<T>(data: T[], criteria: Criteria<T>): Record<string, T[]> {
  if (!data?.length) {
    return {};
  }
  const groups: Record<string, T[]> = Object.keys(criteria).reduce(
    (acc, key) => {
      acc[key] = [];
      return acc;
    },
    {} as Record<string, T[]>
  );

  groups.others = [];

  data.forEach((item) => {
    let matched = false;

    for (const [key, predicate] of Object.entries(criteria)) {
      if (predicate(item)) {
        groups[key].push(item);
        matched = true;
        break;
      }
    }

    if (!matched) {
      groups.others.push(item);
    }
  });

  return groups;
}

export function filterByMatch(source: any[] = [], target: any[] = [], authEnable?: boolean) {
  if (authEnable)
    return source.filter((sourceItem) =>
      target.some((targetItem) => {
        if (sourceItem?.service?.name !== 'frontend') {
          return '/' + sourceItem?.name?.toLowerCase?.() === targetItem.uri?.toLowerCase?.();
        } else {
          return sourceItem?.menu?.url?.toLowerCase?.() === targetItem.uri?.toLowerCase?.();
        }
      })
    );
  return source;
}

// 拒绝优先
export function filterArrays(arr1: string[] = [], arr2: string[] = []) {
  return arr2?.filter?.((item) => !arr1?.includes?.(item));
}

// 拒绝优先
export function filterObjectArrays(arr1: any[] = [], arr2: any[] = []) {
  return arr2.filter((item2) => !arr1.some((item1) => item1.uri === item2.uri));
}

// 判断按钮权限函数
export function matchUriWithPattern(uri: string, pattern: string) {
  // 转换模式（如 button:uns.*）为正则表达式
  const regex = new RegExp('^' + pattern.replace('*', '.*').replace(':', '\\:') + '$');
  return regex.test(uri);
}

// 处理接口返回的模式数组
export function handleButtonPermissions(patterns: string[] = [], permissions: object) {
  const matchedButtons: string[] = [];

  // 如果模式包含 'button:*'，返回所有按钮权限
  if (patterns?.includes?.('button:*')) {
    return [...new Set(Object.values(permissions))];
  }

  // 遍历所有的模式
  patterns.forEach((pattern) => {
    Object.values(permissions).forEach((uri) => {
      if (matchUriWithPattern(uri, pattern)) {
        matchedButtons.push(uri); // 匹配成功的按钮加入到结果数组
      }
    });
  });
  return [...new Set(matchedButtons)];
}
/**
 * @description
 * {key: 国际化的key（既是tag的值），没有国际话的话是''，value是国际化的内容,如果key是空的，value就是tag的值} =》 {key: '', value: menu} {key: 'parentName:DevTools', value: 'DevTools'}
 * */
export const getTagsByObj = (
  tags: {
    key: string;
    value: string;
  }[]
) => {
  return tags.reduce(
    (
      acc: {
        [key: string]: string;
      },
      tag
    ) => {
      if (tag.key) {
        // 检查是否包含冒号，并且将符合条件的转化为 key:value 对象
        const [tagKey, TagValue] = tag.key.split(':');
        if (TagValue !== undefined) {
          acc[tagKey] = TagValue;
          acc[tagKey + 'I18'] = tag.value;
        }
        return acc;
      } else if (tag.value) {
        const [tagKey, TagValue] = tag.value.split(':');
        if (TagValue !== undefined) {
          acc[tagKey] = TagValue;
          acc[tagKey + 'I18'] = '';
        } else if (tagKey === 'remote') {
          acc[tagKey] = '1';
        }
        return acc;
      }
      return acc;
    },
    {}
  );
};

/**
 * @description frontend:abc
 * */
export const getTags = (tags: string[]) => {
  return tags.reduce(
    (
      acc: {
        [key: string]: string;
      },
      tag
    ) => {
      // 检查是否包含冒号，并且将符合条件的转化为 key:value 对象
      const [key, value] = tag.split(':');
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
};

export const getGroupedOptions = (data: RoutesProps[]) => {
  const newData =
    data.map((item: RoutesProps) => {
      const tags = getTagsByObj(item?.tags || []);
      const serviceTags = getTags(item?.service?.tags || []);
      const name = item.showName || item.name;
      const groupKey = tags?.parentName || name; // 使用 parentName 或 name 作为分组键
      return {
        ...item,
        isFrontend: serviceTags?.root === 'frontend' && tags.remote !== '1',
        isRemote: tags.remote,
        remoteSubPageList: tags?.moduleName?.split('.') || [],
        name,
        key: item?.name,
        hasChildren: false,
        children: [],
        iconUrl: tags?.iconUrl,
        description: tags?.description,
        label: name,
        value: item?.name,
        hasParent: !!tags?.parentName,
        parentName: tags?.parentNameI18,
        parentKey: groupKey,
        menuPort: tags?.menuPort,
        openType: tags?.openType,
        indexUrl: tags?.indexUrl,
        menuProtocol: tags?.menuProtocol,
        menuHost: tags?.menuHost,
        selectKeyPath: tags?.parentName ? [item?.name, tags?.parentName] : [item?.name],
        selectKey: [item?.name],
      };
    }) || [];
  const _remoteSubPageList: RoutesProps[] = [];
  newData
    .filter((f) => f.remoteSubPageList?.length > 0)
    ?.forEach((f) => {
      f.remoteSubPageList?.forEach((s) => {
        const key = f.key + '/' + s;
        _remoteSubPageList.push({
          ...f,
          remoteSubPageList: [],
          key,
          value: key,
          // selectKey: [key],
          parentKey: f.key,
          // selectKeyPath: [key, ...f.selectKeyPath],
          isRemoteChildMenu: true,
          childrenMenuKey: s,
        });
      });
    });
  return [...newData, ..._remoteSubPageList];
};

export const getGroupedData = (data: RoutesProps[], parentOrderMap: any, fatherKey: string = 'parentName') => {
  return data
    .reduce((acc: RoutesProps[], item: RoutesProps) => {
      const tags = getTagsByObj(item?.tags || []);
      const serviceTags = getTags(item?.service?.tags || []);
      const name = item.showName || item.name; // menu的展示名
      const groupKey = tags?.[fatherKey] || tags?.parentName || item.name; // 使用 parentName 或 name 作为分组键
      // 查找是否已经存在该分组
      let group = acc.find((g) => g.key === groupKey);
      if (!group) {
        // 如果不存在该分组，则创建一个新的分组
        group = {
          ...item,
          isFrontend: serviceTags?.root === 'frontend' && tags.remote !== '1',
          isRemote: tags.remote,
          remoteSubPageList: tags?.moduleName?.split('.') || [],
          name: tags?.[fatherKey + 'I18'] || tags?.parentNameI18 || name,
          key: groupKey,
          hasChildren: false,
          children: [],
          iconUrl: tags?.[fatherKey] || tags?.parentName,
          description: serviceTags?.description,
          menuPort: tags?.menuPort,
          menuProtocol: tags?.menuProtocol,
          menuHost: tags?.menuHost,
          openType: tags?.openType,
          indexUrl: tags?.indexUrl,
        };
        acc.push(group);
      }
      const iconUrl =
        fatherKey === 'parentName' ? tags?.iconUrl || item.name : tags?.homeIconUrl || tags?.iconUrl || item.name;
      if (tags?.[fatherKey] ?? tags?.parentName) {
        group.hasChildren = true;
        group.menu = undefined;
        group.service = undefined;
        group.tags = undefined;
        group.isFrontend = undefined;
        group.menuPort = undefined;
        group.menuProtocol = undefined;
        group.menuHost = undefined;
        group?.children?.push({
          ...item,
          isFrontend: serviceTags?.root === 'frontend' && tags.remote !== '1',
          isRemote: tags.remote,
          remoteSubPageList: tags?.moduleName?.split('.') || [],
          parentName: group.name,
          parentKey: group.key,
          key: item?.name,
          name,
          iconUrl,
          description: tags?.descriptionI18 || tags?.description,
          sort: tags?.sort,
          menuPort: tags?.menuPort,
          menuProtocol: tags?.menuProtocol,
          menuHost: tags?.menuHost,
          openType: tags?.openType,
          indexUrl: tags?.indexUrl,
        });
      } else {
        group.key = item.name;
        group.iconUrl = tags?.iconUrl || item.name;
        group.description = tags?.descriptionI18 || tags?.description;
        group?.children?.push({
          ...group,
          children: undefined,
          key: item?.name,
          name,
          iconUrl,
          description: tags?.descriptionI18 || tags?.description,
          sort: tags?.sort,
          menuPort: tags?.menuPort,
          menuProtocol: tags?.menuProtocol,
          menuHost: tags?.menuHost,
          openType: tags?.openType,
          indexUrl: tags?.indexUrl,
        });
      }
      return acc;
    }, [])
    .map((item) => {
      // Sort children if they exist
      if (item.children && Array.isArray(item.children)) {
        item.children.sort((a, b) => {
          const sortA = Number(a.sort) || Infinity;
          const sortB = Number(b.sort) || Infinity;
          return sortA - sortB;
        });
      }
      return item;
    })
    .sort((a, b) => {
      const orderA = Number(parentOrderMap[a.key!]) || Infinity; // 如果没有对应的值，放在最后
      const orderB = Number(parentOrderMap[b.key!]) || Infinity;
      return orderA - orderB;
    });
};

// 拆分关于我们和高阶使用
export const filterContainerList = (containerMap: { [key: string]: ContainerItemProps } = {}) => {
  const containerList = Object.values(containerMap);
  const _containerList = containerList?.filter((f) => f.envMap?.service_is_show);
  return {
    advancedUse: _containerList?.filter((f) => f.envMap?.service_redirect_url) || [],
    aboutUs: _containerList || [],
  };
};
