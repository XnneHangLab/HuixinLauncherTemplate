export interface HeroConfettiPiece {
  top: string;
  left: string;
  color: string;
  rotate: string;
  width?: string;
}

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

export const versionMeta = [
  '启动器版本：绘心启动器 0.1.0',
];

export const notices = [
  '当前阶段优先接入 GenieData 下载、环境识别和日志链路。',
  'CPU 环境仅开放 Genie-TTS 基础资源链路，GPU 环境在后续阶段再扩更多后端。',
  '模型下载进入串行队列后，可在模型管理页查看详情，在控制台页查看详细日志。',
];
