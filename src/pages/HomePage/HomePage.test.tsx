import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { HomePage } from './HomePage';
import { toggleLaunchState, type LaunchState } from '../../services/launcher/launcher';

function HomePageHarness() {
  const [launchState, setLaunchState] = useState<LaunchState>('idle');

  return (
    <HomePage
      launchState={launchState}
      onToggleLaunchState={() =>
        setLaunchState((currentState) => toggleLaunchState(currentState))
      }
    />
  );
}

describe('HomePage', () => {
  it('renders the hero, folders, metadata, and announcement panel', () => {
    render(<HomePageHarness />);

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
    expect(
      screen.getByText('启动器版本：绘心启动器 0.1.0'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '绘心是 XnneHangLab 正在持续迭代的启动器产品，也会沉淀为可复用模板，后续会逐步扩展到语音、模型管理与控制台能力。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^▶ 一键启动$/ }),
    ).toBeInTheDocument();
  });

  it('switches the launch button into running state after click', async () => {
    const user = userEvent.setup();

    render(<HomePageHarness />);

    const launchButton = screen.getByRole('button', { name: /^▶ 一键启动$/ });
    expect(launchButton).toHaveAttribute('data-state', 'idle');

    await user.click(launchButton);

    expect(screen.getByRole('button', { name: /^✈ 运行中$/ })).toHaveAttribute(
      'data-state',
      'running',
    );
  });
});
