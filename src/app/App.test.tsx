import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import '../styles/tokens.css';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the launcher preview title', () => {
    render(<App />);

    expect(screen.getByText('UI 复刻预览')).toBeInTheDocument();
  });

  it('applies day theme from storage to launcher root', () => {
    localStorage.setItem('xnnehanglab.theme', 'day');

    const { container } = render(<App />);
    const launcherRoot = container.querySelector('.launcher-root');
    const navHome = screen.getByRole('button', { name: '一键启动' });
    const navStyles = getComputedStyle(navHome);
    const rootStyles = getComputedStyle(launcherRoot as Element);

    expect(launcherRoot).toHaveAttribute(
      'data-theme',
      'day',
    );
    expect(rootStyles.getPropertyValue('--text').trim()).toBe('#182231');
    expect(navStyles.color).toBe('var(--text)');
  });

  it('applies day input colors in settings page', async () => {
    const user = userEvent.setup();
    localStorage.setItem('xnnehanglab.theme', 'day');

    render(<App />);

    await user.click(screen.getByRole('button', { name: '设置' }));

    const proxyInput = screen.getByLabelText('代理服务器地址');
    const styles = getComputedStyle(proxyInput);
    const launcherRoot = document.querySelector('.launcher-root');
    const rootStyles = getComputedStyle(launcherRoot as Element);

    expect(rootStyles.getPropertyValue('--input-bg').trim()).toBe('#ffffff');
    expect(rootStyles.getPropertyValue('--input-text').trim()).toBe('#182231');
    expect(styles.color).toBe('var(--input-text)');
  });
});
