import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../app/App';

describe('AppShell', () => {
  const zeroLengthValues = new Set(['0', '0px']);

  beforeEach(() => {
    localStorage.clear();
  });

  it('switches between nav pages and renders active page content', async () => {
    const user = userEvent.setup();

    const { container } = render(<App />);

    const root = container.querySelector('.launcher-root');
    const shell = container.querySelector('.app-shell');

    expect(root).not.toBeNull();
    expect(shell).not.toBeNull();
    expect(getComputedStyle(root as Element).paddingTop).toBe('0px');
    expect(getComputedStyle(shell as Element).borderTopWidth).toBe('0px');
    expect((root as Element).getAttribute('data-theme')).toBe('night');

    expect(
      screen.getByRole('img', { name: '绘心 Logo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('绘心')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: '主导航' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '帮助' })).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: '窗口控制' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '一键启动' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('一键启动')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '设置' }));
    expect(screen.getByRole('button', { name: '设置' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('tab', { name: '一般设置', selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('代理服务器地址')).toHaveValue(
      'http://127.0.0.1:xxxx',
    );
    expect(
      screen.getByRole('tabpanel', { name: '一般设置' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '模型管理' }));
    expect(screen.getByText('模型管理 页面建设中')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(10);
  });

  it('keeps the shell height constrained when the settings page is active', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: '设置' }));

    const launcherRoot = container.querySelector('.launcher-root');
    const appShell = container.querySelector('.app-shell');
    const contentShell = container.querySelector('.content-shell');
    const pageShell = container.querySelector('.page-shell');
    const settingsShell = container.querySelector('.settings-shell');
    const settingsWrap = container.querySelector('.settings-wrap');

    expect(launcherRoot).not.toBeNull();
    expect(appShell).not.toBeNull();
    expect(contentShell).not.toBeNull();
    expect(pageShell).not.toBeNull();
    expect(settingsShell).not.toBeNull();
    expect(settingsWrap).not.toBeNull();

    expect(getComputedStyle(launcherRoot as Element).height).toBe('100%');
    expect(
      zeroLengthValues.has(getComputedStyle(appShell as Element).minHeight),
    ).toBe(true);
    expect(
      zeroLengthValues.has(getComputedStyle(contentShell as Element).minHeight),
    ).toBe(true);
    expect(
      zeroLengthValues.has(getComputedStyle(pageShell as Element).minHeight),
    ).toBe(true);
    expect(
      zeroLengthValues.has(getComputedStyle(settingsShell as Element).minHeight),
    ).toBe(true);
    expect(
      zeroLengthValues.has(getComputedStyle(settingsWrap as Element).minHeight),
    ).toBe(true);
  });

  it('toggles the theme from the lightbulb item and stores the choice', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const root = container.querySelector('.launcher-root');
    const lightbulb = screen.getByRole('button', { name: '灯泡' });

    expect((root as Element).getAttribute('data-theme')).toBe('night');

    await user.click(lightbulb);

    expect((root as Element).getAttribute('data-theme')).toBe('day');
    expect(localStorage.getItem('xnnehanglab.theme')).toBe('day');
    expect(lightbulb).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores the saved theme on first render', () => {
    localStorage.setItem('xnnehanglab.theme', 'day');
    const { container } = render(<App />);

    const root = container.querySelector('.launcher-root');

    expect((root as Element).getAttribute('data-theme')).toBe('day');
  });
});
