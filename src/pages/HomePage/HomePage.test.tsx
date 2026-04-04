import { render, screen } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the hero, folders, metadata, and announcement panel', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: '绘心 - 启动器' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '文件夹' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '公告' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('XnneHangLab Launcher Template'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /打开 / })).toHaveLength(8);
    expect(screen.getByText('启动器版本：2.6.17 Build 222')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✈ 运行中' })).toBeInTheDocument();
  });
});
