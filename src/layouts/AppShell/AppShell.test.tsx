import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../app/App';

describe('AppShell', () => {
  it('switches between nav pages and renders placeholders', async () => {
    const user = userEvent.setup();

    render(<App />);

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
    expect(screen.getByText('设置 页面建设中')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '模型管理' }));
    expect(screen.getByText('模型管理 页面建设中')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(10);
  });
});
