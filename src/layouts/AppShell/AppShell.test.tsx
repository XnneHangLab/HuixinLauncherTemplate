import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../app/App';

describe('AppShell', () => {
  it('switches between nav pages and renders active page content', async () => {
    const user = userEvent.setup();

    const { container } = render(<App />);

    const root = container.querySelector('.launcher-root');
    const shell = container.querySelector('.app-shell');

    expect(root).not.toBeNull();
    expect(shell).not.toBeNull();
    expect(getComputedStyle(root as Element).paddingTop).toBe('0px');
    expect(getComputedStyle(shell as Element).borderTopWidth).toBe('0px');

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
});
