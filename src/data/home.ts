export interface HeroConfettiPiece {
  top: string;
  left: string;
  color: string;
  rotate: string;
  width?: string;
}

export interface FolderItem {
  title: string;
  path: string;
  icon: string;
}

export type LaunchButtonState = 'idle' | 'running';

export const heroCopy = {
  eyebrow: 'XnneHangLab Launcher Template',
  title: '绘心 - 启动器',
  description: '让 AI 更有温度，也更适合长期陪伴。',
};

export const heroConfetti: HeroConfettiPiece[] = [
  { top: '40px', left: '63%', color: '#ffd54b', rotate: '-28deg' },
  { top: '72px', left: '70%', color: '#7ef9ff', rotate: '-52deg', width: '24px' },
  { top: '54px', left: '81%', color: '#ff79c6', rotate: '16deg', width: '22px' },
  { top: '120px', left: '88%', color: '#ffe36f', rotate: '-62deg', width: '26px' },
  { top: '126px', left: '28%', color: '#ff9a43', rotate: '-28deg', width: '12px' },
  { top: '165px', left: '16%', color: '#8dd0ff', rotate: '18deg', width: '18px' },
  { top: '196px', left: '10%', color: '#f1cf67', rotate: '-12deg', width: '22px' },
  { top: '178px', left: '76%', color: '#72a7ff', rotate: '-32deg', width: '18px' },
];

export const folders: FolderItem[] = [
  { title: '根目录', path: '.', icon: '📁' },
  { title: '扩展文件夹', path: 'extensions', icon: '🧷' },
  { title: '临时文件夹', path: 'tmp', icon: '🧹' },
  { title: '超分输出', path: 'extras-images', icon: '⊞' },
  { title: '文生图（网格）', path: 'txt2img-grids', icon: '🖹' },
  { title: '文生图（单图）', path: 'txt2img-images', icon: '📄' },
  { title: '图生图（网格）', path: 'img2img-grids', icon: '🖼' },
  { title: '图生图（单图）', path: 'img2img-images', icon: '▣' },
];

export const versionMeta = [
  '启动器版本：2.6.17 Build 222',
  '源码交付标签：2023-12-15 13:55',
  'SD-WebUI 版本：4afasf8 · add changelog c... (2023-11-04 00:50:14)',
];

export const notices = [
  '近期有人假冒所谓“秋叶研发小组人员”散布欺诈消息，请注意甄别身份与启动器均为个人项目，不存在任何研发小组概念，请提高警惕，谨防诈骗。',
  '本启动器免费提供，如您通过其他渠道付费获得本软件，请立即退款并投诉相关商家。',
  '本启动器作者为纯白忧伤王秋葉 aaki@bilibili（UID 12566101）。',
];

export const launchButtonLabels: Record<LaunchButtonState, string> = {
  idle: '▶ 一键启动',
  running: '✈ 运行中',
};

export function toggleLaunchButtonState(
  currentState: LaunchButtonState,
): LaunchButtonState {
  return currentState === 'idle' ? 'running' : 'idle';
}
