import Cookies from 'js-cookie';
import { useBaseStore } from '@/stores/base';

export const TokenKey = 'supos_community_token';

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token: string, options?: any) {
  return Cookies.set(TokenKey, token, options);
}

export function removeToken() {
  return Cookies.remove(TokenKey, { path: '/' });
}

export function getCookie(key: any) {
  return Cookies.get(key);
}

export function setCookie(key: any, value: any, expires?: any) {
  return Cookies.set(key, value, { expires });
}

export function removeCookie(key: any) {
  return Cookies.remove(key);
}

export const hasPermission = (auth: string | string[]) => {
  // const perms = storageOpt.get(SUPOS_USER_BUTTON_LIST);
  const perms = useBaseStore.getState().buttonList;
  if (auth instanceof Array) {
    return auth?.some((item) => perms?.includes(item));
  } else {
    return perms?.includes(auth);
  }
};

export const filterPermissionToList = <T, K extends string = 'auth'>(
  list: (T & { [P in K]?: string | string[] })[],
  key: K = 'auth' as K
): T[] => {
  return list
    ?.filter((item) => {
      const itemAny = item as any;
      if (!itemAny[key]) {
        return true;
      } else {
        return hasPermission(itemAny[key]);
      }
    })
    ?.map((item) => {
      const newItem = { ...item } as any;
      delete newItem[key];
      return newItem as T;
    });
};
