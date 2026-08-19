import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { setLang } from './lib/i18n';

beforeEach(() => localStorage.clear());
afterEach(() => setLang('en'));

describe('App language switching', () => {
  it('switches the whole UI to Spanish from the Log settings', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Calc.' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Español' }));
    expect(screen.getByRole('button', { name: 'Calculadoras' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Registro' })).toBeInTheDocument();
    // and back
    await userEvent.click(screen.getByRole('button', { name: /ajustes/i }));
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('button', { name: 'Calc.' })).toBeInTheDocument();
  });
});
