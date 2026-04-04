export type PageId =
  | 'home'
  | 'settings'
  | 'advanced'
  | 'troubleshooting'
  | 'versions'
  | 'models'
  | 'tools'
  | 'community'
  | 'ideas'
  | 'console';

export interface NavItemData {
  id: PageId;
  label: string;
  icon: string;
  section: 'primary' | 'secondary';
}

export const navItems: NavItemData[] = [
  { id: 'home', label: '一键启动', icon: '▶', section: 'primary' },
  { id: 'settings', label: '设置', icon: '⚙', section: 'primary' },
  { id: 'advanced', label: '高级选项', icon: '≣', section: 'primary' },
  { id: 'troubleshooting', label: '疑难解答', icon: '⌘', section: 'primary' },
  { id: 'versions', label: '版本管理', icon: '🕘', section: 'primary' },
  { id: 'models', label: '模型管理', icon: '◫', section: 'primary' },
  { id: 'tools', label: '小工具', icon: '🧰', section: 'primary' },
  { id: 'community', label: '交流群', icon: '💬', section: 'secondary' },
  { id: 'ideas', label: '灯泡', icon: '💡', section: 'secondary' },
  { id: 'console', label: '控制台', icon: '⌨', section: 'secondary' },
];
