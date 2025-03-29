import Cookies from 'js-cookie';
import { storageOpt } from './storage.ts';
import { SUPOS_USER_BUTTON_LIST } from '@/common-types/constans.ts';

export const TokenKey = 'supos_community_token';

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token: string) {
  return Cookies.set(TokenKey, token, { expires: 1 });
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
  const perms = storageOpt.get(SUPOS_USER_BUTTON_LIST);
  if (auth instanceof Array) {
    return auth?.some((item) => perms?.includes(item));
  } else {
    return perms?.includes(auth);
  }
};
