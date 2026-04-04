import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem('xnnehanglab.theme', 'day');
  });

  it('renders the launcher preview title', () => {
    render(<App />);

    expect(screen.getByText('UI 复刻预览')).toBeInTheDocument();
  });

  it('applies day theme from storage to launcher root', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.launcher-root')).toHaveAttribute(
      'data-theme',
      'day',
    );
  });
});
