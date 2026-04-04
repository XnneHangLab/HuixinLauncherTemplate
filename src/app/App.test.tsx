import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the launcher preview title', () => {
    render(<App />);

    expect(screen.getByText('UI 复刻预览')).toBeInTheDocument();
  });
});
