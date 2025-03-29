import { storageOpt } from '@/utils';
import { SUPOS_REAL_THEME, SUPOS_STORAGE_MENU_TYPE, SUPOS_THEME } from '@/common-types/constans.ts';
import { makeAutoObservable, runInAction } from 'mobx';

export enum MenuTypeEnum {
  Fixed = 'fixed',
  Top = 'top',
}
export enum ThemeTypeEnum {
  // 主题命名一定要以 light/dark-主题色为准
  LightBlue = 'light-blue',
  DarkBlue = 'dark-blue',
  DarkChartreuse = 'dark-chartreuse',
  LightChartreuse = 'light-chartreuse',
  System = 'system',
}

export type MenuTypeProps = MenuTypeEnum.Fixed | MenuTypeEnum.Top;

const setThemeRoot = (theme: string) => {
  const root = document.documentElement;
  switch (theme) {
    case ThemeTypeEnum.DarkBlue:
      {
        root.classList.remove('chartreuse', 'chartreuseDark');
        root.classList.add('dark');
      }
      break;
    case ThemeTypeEnum.LightBlue:
      {
        root.classList.remove('dark', 'chartreuse', 'chartreuseDark');
      }
      break;
    case ThemeTypeEnum.DarkChartreuse:
      {
        root.classList.add('chartreuse', 'chartreuseDark', 'dark');
      }
      break;
    case ThemeTypeEnum.LightChartreuse:
      {
        root.classList.remove('dark', 'chartreuseDark');
        root.classList.add('chartreuse');
      }
      break;
    default:
      {
        root.classList.remove('dark', 'chartreuse', 'chartreuseDark');
      }
      break;
  }
};
const getThemeBySystem = (theme: string, isDark: boolean) => {
  const [, baseTheme] = theme.split('-');
  return `${isDark ? 'dark' : 'light'}-${baseTheme || 'blue'}`;
};
// chat2db主题
/**
 * primary-color: polar-blue,polar-green
 * theme light dark  darkDimmed
 * */
const setCha2dbTheme = (theme: string = ThemeTypeEnum.LightBlue) => {
  const primaryColor = theme.includes('blue') ? 'polar-blue' : 'polar-green';
  const _theme = theme.includes('dark') ? 'dark' : 'light';
  storageOpt.setOrigin('theme', _theme);
  storageOpt.setOrigin('primary-color', primaryColor);
};

export class ThemeStore {
  menuType: MenuTypeProps = MenuTypeEnum.Fixed;
  // 真实的主题色
  theme: string = 'light-blue';
  // 加了系统配色
  _theme: string = 'light-blue';
  constructor() {
    makeAutoObservable(this);
    this.menuType = storageOpt.get(SUPOS_STORAGE_MENU_TYPE) || MenuTypeEnum.Top;
    this.theme = storageOpt.getOrigin(SUPOS_THEME) || ThemeTypeEnum.LightBlue;
    this._theme = storageOpt.getOrigin(SUPOS_REAL_THEME) || ThemeTypeEnum.LightBlue;
    setCha2dbTheme(this.theme);
    // 主题初始化
    setThemeRoot(this.theme);
  }
  // 筛选出勾选的路由
  get isTop() {
    return this.menuType === MenuTypeEnum.Top;
  }
  setMenuType(menuType: MenuTypeProps = MenuTypeEnum.Fixed) {
    runInAction(() => {
      this.menuType = menuType;
      storageOpt.set(SUPOS_STORAGE_MENU_TYPE, menuType);
    });
  }
  setTheme(newTheme: ThemeTypeEnum = ThemeTypeEnum.LightBlue) {
    runInAction(() => {
      if (newTheme === ThemeTypeEnum.System) {
        const theme = getThemeBySystem(this.theme, window.matchMedia('(prefers-color-scheme: dark)')?.matches);
        storageOpt.setOrigin(SUPOS_THEME, theme);
        storageOpt.setOrigin('dark-mode', theme.includes('dark') ? 'on' : 'off');
        this.theme = theme;
        setCha2dbTheme(theme);
        setThemeRoot(theme);
      } else {
        storageOpt.setOrigin(SUPOS_THEME, newTheme);
        storageOpt.setOrigin('dark-mode', newTheme.includes('dark') ? 'on' : 'off');
        this.theme = newTheme;
        setCha2dbTheme(newTheme);
        setThemeRoot(newTheme);
      }
      storageOpt.setOrigin(SUPOS_REAL_THEME, newTheme);
      this._theme = newTheme;
    });
  }

  setThemeBySystem(isDark: boolean) {
    if (this._theme === 'system') {
      storageOpt.setOrigin('dark-mode', isDark ? 'on' : 'off');
      runInAction(() => {
        const theme = getThemeBySystem(this.theme, isDark);
        storageOpt.setOrigin(SUPOS_REAL_THEME, theme);
        this.theme = theme;
        setCha2dbTheme(theme);
        setThemeRoot(theme);
      });
    }
  }
}

export default new ThemeStore();
