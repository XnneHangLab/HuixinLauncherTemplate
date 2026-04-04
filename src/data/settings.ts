export type SettingsTabId = 'general' | 'about';

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
}

export interface ToggleSetting {
  id: string;
  label: string;
  description?: string;
  defaultValue: boolean;
  icon?: string;
}

export const settingsTabs: SettingsTab[] = [
  { id: 'general', label: '一般设置' },
  { id: 'about', label: '关于' },
];

export const proxyDefaults = {
  address: 'http://127.0.0.1:xxxx',
  git: true,
  pip: true,
  env: true,
  modelDownload: true,
};

export const mirrorSettings: ToggleSetting[] = [
  {
    id: 'pypiMirror',
    label: 'PyPI 国内镜像',
    description: '通过国内镜像下载 Python 软件包',
    defaultValue: false,
    icon: 'Py',
  },
  {
    id: 'gitMirror',
    label: 'Git 国内镜像',
    description: '通过国内镜像下载 Git 仓库',
    defaultValue: false,
    icon: '⎇',
  },
  {
    id: 'hfMirror',
    label: 'Huggingface 国内镜像',
    description: '通过国内镜像下载 Huggingface 模型',
    defaultValue: false,
    icon: '🤗',
  },
  {
    id: 'replaceExtensionList',
    label: '替换扩展列表链接',
    description: '将内置扩展列表链接替换为国内镜像链接',
    defaultValue: false,
    icon: '📄',
  },
  {
    id: 'githubAccel',
    label: 'GitHub 加速',
    description: '提供未镜像的扩展下载速度',
    defaultValue: false,
    icon: '◎',
  },
];

export const preferenceSettings: ToggleSetting[] = [
  {
    id: 'darkTheme',
    label: '主题模式',
    description: '深色主题，复刻原界面质感',
    defaultValue: true,
    icon: '🎨',
  },
  {
    id: 'pagePreview',
    label: '页面预览',
    description: '点击左侧导航可切换主页与设置页',
    defaultValue: true,
    icon: '🗂',
  },
];

export const aboutInfo = [
  'XnneHangLab Launcher Template',
  '第一阶段聚焦于桌面壳和 UI 复刻。',
  '后续将逐步接入环境检查、下载和启动逻辑。',
];
