import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('renders settings controls and switches tabs', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    expect(
      screen.getByRole('tab', { name: '一般设置', selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'id',
      'settings-tab-general',
    );
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'aria-controls',
      'settings-panel-general',
    );
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tabpanel', { name: '一般设置' })).toHaveAttribute(
      'id',
      'settings-panel-general',
    );
    expect(screen.getByLabelText('代理服务器地址')).toHaveValue(
      'http://127.0.0.1:xxxx',
    );
    expect(
      screen.getByRole('button', { name: '将代理应用到 Git' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('tab', { name: '关于' }));
    expect(screen.getByRole('tab', { name: '关于' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tab', { name: '一般设置' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('tabpanel', { name: '关于' })).toHaveAttribute(
      'id',
      'settings-panel-about',
    );
    expect(
      screen.getByText('XnneHangLab Launcher Template'),
    ).toBeInTheDocument();
  });
});
